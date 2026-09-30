'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Volume2, 
  BookOpen, 
  MessageSquare, 
  Check, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Lightbulb, 
  Tag, 
  Plus, 
  Trash2,
  BookmarkCheck,
  PlayCircle
} from 'lucide-react';
import audioManager from '../lib/audioManager';
import { getAuthSession } from '../lib/supabaseSync';
import { useApp } from '../lib/AppContext';
import { useRouter } from 'next/navigation';
import ComprehensionQuiz from './ComprehensionQuiz';

export const THEME_PRESETS = [
  { id: 'daily', label: 'Vida Cotidiana', icon: '🏠', prompt: 'Vida cotidiana, rutinas en el hogar y compras' },
  { id: 'food', label: 'Comida & Restaurantes', icon: '🍱', prompt: 'Comida japonesa, pedir en un restaurante y sabores' },
  { id: 'travel', label: 'Viajes & Transporte', icon: '🚆', prompt: 'Viajes por Japón, trenes, estaciones y direcciones' },
  { id: 'work', label: 'Trabajo & Negocios', icon: '💼', prompt: 'Oficina, reuniones de trabajo y cortesía profesional' },
  { id: 'culture', label: 'Cultura & Tradición', icon: '🌸', prompt: 'Festivales, templos, estaciones del año y té' },
  { id: 'anime', label: 'Anime, Manga & Ocio', icon: '🎌', prompt: 'Amistades, pasatiempos, emociones y cultura pop' },
  { id: 'school', label: 'Escuela & Estudio', icon: '🏫', prompt: 'Clases de japonés, exámenes, biblioteca y profesores' },
  { id: 'mystery', label: 'Misterio & Aventura', icon: '🔍', prompt: 'Un pequeño misterio urbano, investigación y curiosidades' },
  { id: 'custom', label: 'Tema Libre / Personalizado', icon: '✏️', prompt: '' }
];

export default function AIGeneratorModal({
  isOpen,
  onClose,
  initialType = 'story', // 'story' | 'sentences'
  initialItems = [],
  itemType = 'vocab', // 'vocab' | 'kanji'
  defaultLevel = 'N5',
  appState,
  onUpdateState,
  onNavigate,
  authUser: propAuthUser = null
}) {
  let contextApp = null;
  try {
    contextApp = useApp();
  } catch (e) {}

  const router = useRouter();
  const authUser = propAuthUser || contextApp?.authUser;
  const showAlert = contextApp?.showAlert || ((opts) => alert(opts.message || opts.title));
  const showConfirm = contextApp?.showConfirm || (() => Promise.resolve(true));

  // Configuration state
  const [contentType, setContentType] = useState(initialType); // 'story' | 'sentences' | 'conversation'
  const [selectedItems, setSelectedItems] = useState([]);
  const [newItemInput, setNewItemInput] = useState('');
  const [level, setLevel] = useState(defaultLevel === 'all' ? 'N5' : defaultLevel);
  const [selectedThemeId, setSelectedThemeId] = useState('daily');
  const [customThemeText, setCustomThemeText] = useState('');
  const [sentenceCount, setSentenceCount] = useState(5);
  const [dialogueTurns, setDialogueTurns] = useState(8);
  const [storyLength, setStoryLength] = useState('medium'); // 'short' | 'medium' | 'long'

  // Generation & Results state
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [resultStory, setResultStory] = useState(null);
  const [resultSentences, setResultSentences] = useState(null);
  const [resultConversation, setResultConversation] = useState(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedSentenceIds, setSavedSentenceIds] = useState(new Set());
  const [readingMode, setReadingMode] = useState('natural'); // 'natural' | 'kanji_only' | 'hiragana'

  // Sync initial items when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialItems && initialItems.length > 0) {
        const normalized = initialItems.map(it => {
          if (typeof it === 'string') {
            return { text: it, reading: '', meaning: '' };
          }
          return {
            text: it.kanji || it.text || it.char || it.kana || '',
            reading: it.kana || it.hiragana || it.pronunciation || it.reading || '',
            meaning: it.meaning_es || it.meaning || ''
          };
        }).filter(it => it.text);
        setSelectedItems(normalized);
      } else {
        setSelectedItems([]);
      }
      if (defaultLevel && defaultLevel !== 'all') {
        setLevel(defaultLevel);
      }
      if (initialType) {
        setContentType(initialType);
      }
      setResultStory(null);
      setResultSentences(null);
      setResultConversation(null);
      setSavedSuccess(false);
      setSavedSentenceIds(new Set());
    }
  }, [isOpen, initialItems, defaultLevel, initialType]);

  // Loading animation message cycler
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const loadingMessages = [
    `Analizando ${itemType === 'kanji' ? 'kanjis' : 'palabras'} y calibrando nivel ${level}...`,
    `Tejiendo contexto temático en japonés natural...`,
    `Generando lecturas en furigana, traducciones y notas didácticas...`,
    `Verificando coherencia y audio neuronal...`
  ];

  const handleAddItem = () => {
    const trimmed = newItemInput.trim();
    if (!trimmed) return;
    if (selectedItems.some(i => i.text === trimmed)) {
      setNewItemInput('');
      return;
    }
    setSelectedItems(prev => [...prev, { text: trimmed, reading: '', meaning: '' }]);
    setNewItemInput('');
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const effectiveTheme = useMemo(() => {
    if (selectedThemeId === 'custom') {
      return customThemeText.trim() || 'Situación de la vida cotidiana';
    }
    const preset = THEME_PRESETS.find(p => p.id === selectedThemeId);
    return preset ? preset.prompt : 'Vida cotidiana';
  }, [selectedThemeId, customThemeText]);

  const handleGenerate = async () => {
    // 1. Requerir sesión activa para generar con IA
    if (!authUser) {
      showAlert({
        type: 'lock',
        title: 'Generación con Inteligencia Artificial',
        message: 'Debes iniciar sesión con tu cuenta de Google o correo para generar historias u oraciones personalizadas con IA.',
        actionLabel: 'Iniciar Sesión',
        onAction: () => {
          onClose();
          if (contextApp?.setIsAuthModalOpen) {
            contextApp.setIsAuthModalOpen(true);
          }
        }
      });
      return;
    }

    if (selectedItems.length === 0) {
      showAlert({
        type: 'warning',
        title: 'Selecciona Elementos',
        message: `Por favor agrega al menos un ${itemType === 'kanji' ? 'kanji' : 'palabra'} para generar contenido.`
      });
      return;
    }

    setIsGenerating(true);
    setLoadingStep(0);
    setResultStory(null);
    setResultSentences(null);
    setResultConversation(null);
    setSavedSuccess(false);

    try {
      const itemsList = selectedItems.map(i => i.text);
      const session = await getAuthSession();
      const token = session?.access_token;

      if (!token) {
        showAlert({
          type: 'lock',
          title: 'Sesión Requerida',
          message: 'Tu sesión no está activa o ha expirado. Por favor vuelve a iniciar sesión.',
          actionLabel: 'Iniciar Sesión',
          onAction: () => {
            onClose();
            if (contextApp?.setIsAuthModalOpen) {
              contextApp.setIsAuthModalOpen(true);
            }
          }
        });
        setIsGenerating(false);
        return;
      }

      const payload = {
        type: contentType,
        items: itemsList,
        itemType,
        level,
        theme: effectiveTheme,
        length: storyLength,
        count: contentType === 'conversation' ? dialogueTurns : sentenceCount,
        provider: 'groq'
      };

      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        showAlert({
          type: 'error',
          title: 'Error de Generación',
          message: data.error || 'No se pudo generar el contenido con el servicio de IA.',
          actionLabel: response.status === 401 ? 'Iniciar Sesión' : undefined,
          onAction: response.status === 401 ? () => {
            onClose();
            if (contextApp?.setIsAuthModalOpen) {
              contextApp.setIsAuthModalOpen(true);
            }
          } : undefined
        });
        setIsGenerating(false);
        return;
      }

      if (contentType === 'story' && data.story) {
        setResultStory(data.story);
      } else if (contentType === 'conversation' && data.conversation) {
        setResultConversation(data.conversation);
      } else if (contentType === 'sentences' && data.sentences) {
        setResultSentences(data.sentences);
      }
    } catch (err) {
      console.error('Error generating AI content:', err);
      showAlert({
        type: 'error',
        title: 'Error de Red',
        message: 'No se pudo conectar con el servidor para generar el contenido con IA. Revisa tu conexión.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save generated story to library
  const handleSaveStory = (autoOpen = false) => {
    if (!resultStory) return;

    const newStory = {
      id: `custom_${Date.now()}`,
      title: resultStory.title || 'Historia Personalizada',
      title_en: resultStory.title_en || 'Historia con IA',
      difficulty: resultStory.difficulty || level,
      theme: effectiveTheme,
      description: resultStory.description || `Generada con ${selectedItems.length} elementos de estudio.`,
      wordsUsed: resultStory.wordsUsed || selectedItems.map(i => i.text),
      paragraphs: resultStory.paragraphs || [],
      sentences: resultStory.sentences || [],
      comprehension_questions: resultStory.comprehension_questions || [],
      createdAt: new Date().toISOString(),
      isCustom: true
    };

    const updatedStories = [newStory, ...(appState?.savedStories || [])];
    const newXp = (appState?.xp || 0) + 50;

    onUpdateState({
      ...appState,
      savedStories: updatedStories,
      xp: newXp
    });

    setSavedSuccess(true);

    showAlert({
      type: 'success',
      title: '¡Historia Guardada! (+50 XP)',
      message: 'La historia interactiva ha sido añadida a tu Biblioteca de Historias.'
    });

    if (autoOpen) {
      onClose();
      if (onNavigate) {
        onNavigate('story');
      } else {
        router.push(`/story?id=${newStory.id}`);
      }
    }
  };

  // Save generated conversation to library and Supabase
  const handleSaveConversation = (autoOpen = false) => {
    if (!resultConversation) return;

    const newConv = {
      id: `conv_custom_${Date.now()}`,
      title_jp: resultConversation.title_jp || '会話 (Diálogo con IA)',
      title_es: resultConversation.title_es || effectiveTheme,
      level: resultConversation.level || level,
      topic: resultConversation.topic || effectiveTheme,
      characters: resultConversation.characters || ['Persona A', 'Persona B'],
      dialogue: resultConversation.dialogue || [],
      grammar_notes: resultConversation.grammar_notes || [],
      comprehension_questions: resultConversation.comprehension_questions || [],
      words_used: resultConversation.vocabulary_used || selectedItems.map(i => i.text),
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
      isCustom: true,
      source: 'Generador IA'
    };

    const updatedConversations = [newConv, ...(appState?.savedConversations || [])];
    const newXp = (appState?.xp || 0) + 50;

    onUpdateState({
      ...appState,
      savedConversations: updatedConversations,
      xp: newXp
    });

    setSavedSuccess(true);

    showAlert({
      type: 'success',
      title: '¡Conversación Guardada! (+50 XP)',
      message: 'El diálogo y sus 3 preguntas de comprensión se han guardado en tu cuenta y sincronizado en Supabase.'
    });

    if (autoOpen) {
      onClose();
      if (onNavigate) {
        onNavigate('nhk');
      } else {
        router.push('/nhk?tab=saved');
      }
    }
  };

  // Save individual sentence to savedPhrases
  const handleSaveSentence = (sent, idx) => {
    const phraseObj = {
      id: `phrase_ai_${Date.now()}_${idx}`,
      japanese: sent.japanese,
      translation: sent.translation,
      furigana: sent.furigana,
      notes: sent.grammar_note || (sent.target ? `Objetivo: ${sent.target}` : ''),
      source: `IA · ${level} (${effectiveTheme.slice(0, 20)})`,
      level: level,
      date: new Date().toISOString()
    };

    const updatedPhrases = [phraseObj, ...(appState?.savedPhrases || [])];
    const newXp = (appState?.xp || 0) + 15;

    onUpdateState({
      ...appState,
      savedPhrases: updatedPhrases,
      xp: newXp
    });

    setSavedSentenceIds(prev => new Set(prev).add(sent.id || idx));
  };

  // Save all generated sentences
  const handleSaveAllSentences = () => {
    if (!resultSentences || resultSentences.length === 0) return;

    const newPhrases = resultSentences.map((sent, idx) => ({
      id: `phrase_ai_${Date.now()}_${idx}`,
      japanese: sent.japanese,
      translation: sent.translation,
      furigana: sent.furigana,
      notes: sent.grammar_note || (sent.target ? `Objetivo: ${sent.target}` : ''),
      source: `IA · ${level} (${effectiveTheme.slice(0, 20)})`,
      level: level,
      date: new Date().toISOString()
    }));

    const updatedPhrases = [...newPhrases, ...(appState?.savedPhrases || [])];
    const newXp = (appState?.xp || 0) + (15 * newPhrases.length);

    onUpdateState({
      ...appState,
      savedPhrases: updatedPhrases,
      xp: newXp
    });

    setSavedSuccess(true);
    setSavedSentenceIds(new Set(resultSentences.map((s, idx) => s.id || idx)));

    showAlert({
      type: 'success',
      title: `¡${newPhrases.length} Frases Guardadas! (+${15 * newPhrases.length} XP)`,
      message: 'Las oraciones se han añadido a tu Cuaderno de Frases en la sección Guardados.'
    });
  };

  const handleCopyText = () => {
    let textToCopy = '';
    if (resultStory) {
      textToCopy = `${resultStory.title} (${resultStory.title_en})\nNivel: ${resultStory.difficulty}\n\n`;
      if (resultStory.paragraphs) {
        textToCopy += resultStory.paragraphs.map(p => `${p.japanese}\n${p.english}`).join('\n\n');
      }
    } else if (resultSentences) {
      textToCopy = resultSentences.map((s, idx) => 
        `${idx + 1}. ${s.japanese}\n   ${s.furigana}\n   🇪🇸 ${s.translation}\n   💡 ${s.grammar_note}`
      ).join('\n\n');
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    }
  };

  // Helper to render paragraph with ruby
  const renderRubyParagraph = (paragraph) => {
    if (!paragraph) return null;
    const rawJp = paragraph.japanese || '';
    const rubyDict = paragraph.rubyDict || {};

    if (readingMode === 'kanji_only') {
      return <div className="jp-text" style={{ fontSize: '1.25rem', lineHeight: 1.8 }}>{rawJp}</div>;
    }

    const keys = Object.keys(rubyDict);
    if (keys.length === 0 || readingMode === 'hiragana') {
      return (
        <div className="jp-text" style={{ fontSize: '1.25rem', lineHeight: 1.8 }}>
          {readingMode === 'hiragana' ? (paragraph.hiragana || rawJp) : rawJp}
        </div>
      );
    }

    const sortedKeys = [...keys].sort((a, b) => b.length - a.length);
    const escaped = sortedKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const reg = new RegExp(escaped.join('|'), 'g');
    const html = rawJp.replace(reg, (k) => `<ruby class="ruby-clickable">${k}<rt>${rubyDict[k] || ''}</rt></ruby>`);

    return (
      <div 
        className="jp-text"
        style={{ fontSize: '1.25rem', lineHeight: 2.1 }}
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={(e) => {
          const ruby = e.target.closest('ruby');
          if (ruby) {
            audioManager.speak(ruby.innerText);
          }
        }}
      />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-window" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: 780, 
          width: '92%', 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          borderRadius: 16
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Generador de Contenido con IA
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Crea historias u oraciones adaptadas por nivel y tema con tus {itemType === 'kanji' ? 'kanjis' : 'palabras'} seleccionados.
              </p>
            </div>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{ width: 32, height: 32, borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          
          {/* Auth requirement notice */}
          {!authUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: '0.86rem',
              color: 'var(--text-main)',
              marginBottom: 18
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.25rem' }}>🔒</span>
                <span>
                  Para generar historias u oraciones con IA debes <strong>iniciar sesión</strong> con tu cuenta.
                </span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => {
                  onClose();
                  if (contextApp?.setIsAuthModalOpen) {
                    contextApp.setIsAuthModalOpen(true);
                  }
                }}
              >
                Iniciar Sesión
              </button>
            </div>
          )}

          {/* If NOT generated yet */}
          {!resultStory && !resultSentences && !resultConversation && !isGenerating && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Type Selector (Story vs Conversation vs Sentences) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  1. ¿Qué deseas generar?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setContentType('story')}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: contentType === 'story' ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: contentType === 'story' ? 'var(--primary-bg, rgba(99, 102, 241, 0.08))' : 'var(--surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: contentType === 'story' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem', marginBottom: 4 }}>
                      <BookOpen size={18} />
                      <span>📖 Historia Interactiva</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      Relato con furigana, audio, desglose y 3 preguntas de comprensión.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContentType('conversation')}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: contentType === 'conversation' ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: contentType === 'conversation' ? 'var(--primary-bg, rgba(99, 102, 241, 0.08))' : 'var(--surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: contentType === 'conversation' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem', marginBottom: 4 }}>
                      <MessageSquare size={18} />
                      <span>💬 Diálogo Cotidiano</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      Conversación entre 2 personajes con audio, notas y 3 preguntas de comprensión.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContentType('sentences')}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: contentType === 'sentences' ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: contentType === 'sentences' ? 'var(--primary-bg, rgba(99, 102, 241, 0.08))' : 'var(--surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: contentType === 'sentences' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem', marginBottom: 4 }}>
                      <Tag size={18} />
                      <span>✍️ Oraciones de Ejemplo</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      Oraciones contextuales con audio, transcripción en kana y notas.
                    </span>
                  </button>
                </div>
              </div>

              {/* Selected Items */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    2. {itemType === 'kanji' ? 'Kanjis' : 'Palabras'} seleccionadas ({selectedItems.length}):
                  </label>
                  {selectedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedItems([])}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Trash2 size={13} />
                      <span>Limpiar todos</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {selectedItems.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: 'var(--primary-light)',
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      <strong className="jp-text">{item.text}</strong>
                      {item.meaning && <span style={{ opacity: 0.7, fontSize: '0.78rem' }}>({item.meaning})</span>}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', opacity: 0.8 }}
                        title="Quitar"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  {selectedItems.length === 0 && (
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No has seleccionado {itemType === 'kanji' ? 'kanjis' : 'palabras'}. Puedes agregar abajo manualmente:
                    </span>
                  )}
                </div>

                {/* Add manual item */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="search-input"
                    placeholder={`Escribir ${itemType === 'kanji' ? 'un kanji (ej: 食)' : 'una palabra (ej: 食べる)'} y presionar Enter...`}
                    value={newItemInput}
                    onChange={(e) => setNewItemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    style={{ flex: 1, padding: '7px 12px', fontSize: '0.88rem' }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleAddItem}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <Plus size={15} />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

              {/* JLPT Level Regulation */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  3. Nivel de dificultad JLPT:
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { id: 'N5', title: 'N5 (Principiante)', desc: 'Vocabulario básico y gramática esencial' },
                    { id: 'N4', title: 'N4 (Elemental)', desc: 'Formas verbales y oraciones compuestas' },
                    { id: 'N3', title: 'N3 (Intermedio)', desc: 'Contexto social y matices cotidianos' },
                    { id: 'N2', title: 'N2 (Pre-avanzado)', desc: 'Artículos, discursos y formalidades' },
                    { id: 'N1', title: 'N1 (Avanzado)', desc: 'Estructuras sofisticadas y literatura' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      className={`btn ${level === lvl.id ? 'btn-primary' : 'btn-outline'} btn-sm`}
                      onClick={() => setLevel(lvl.id)}
                      style={{ padding: '6px 14px', borderRadius: 8, fontWeight: 700 }}
                      title={lvl.desc}
                    >
                      {lvl.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme / Context Regulation */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  4. Tema o contexto deseado:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: 10 }}>
                  {THEME_PRESETS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedThemeId(t.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: selectedThemeId === t.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: selectedThemeId === t.id ? 'var(--primary-bg, rgba(99, 102, 241, 0.1))' : 'var(--surface)',
                        color: selectedThemeId === t.id ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: selectedThemeId === t.id ? 700 : 500,
                        fontSize: '0.83rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                {selectedThemeId === 'custom' && (
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Escribe tu propio tema (ej: 'Hacer amigos en una cafetería de Shibuya', 'Un gato ninja')..."
                      value={customThemeText}
                      onChange={(e) => setCustomThemeText(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem' }}
                    />
                  </div>
                )}
              </div>

              {/* Length / Turn / Sentence Count */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  5. {contentType === 'story' ? 'Extensión de la historia:' : contentType === 'conversation' ? 'Longitud del diálogo:' : 'Cantidad de oraciones:'}
                </label>
                {contentType === 'story' ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { id: 'short', label: 'Corta (4-5 oraciones)' },
                      { id: 'medium', label: 'Media (6-8 oraciones)' },
                      { id: 'long', label: 'Completa (9-12 oraciones)' }
                    ].map((len) => (
                      <button
                        key={len.id}
                        type="button"
                        className={`btn ${storyLength === len.id ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        onClick={() => setStoryLength(len.id)}
                        style={{ padding: '6px 12px' }}
                      >
                        {len.label}
                      </button>
                    ))}
                  </div>
                ) : contentType === 'conversation' ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[6, 8, 10, 12].map((turns) => (
                      <button
                        key={turns}
                        type="button"
                        className={`btn ${dialogueTurns === turns ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        onClick={() => setDialogueTurns(turns)}
                        style={{ minWidth: 60, padding: '6px 14px' }}
                      >
                        {turns} turnos
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[3, 5, 8].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`btn ${sentenceCount === c ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        onClick={() => setSentenceCount(c)}
                        style={{ minWidth: 60, padding: '6px 14px' }}
                      >
                        {c} oraciones
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Loading Animation */}
          {isGenerating && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{
                width: 64,
                height: 64,
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                animation: 'pulse 1.6s infinite ease-in-out',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
              }}>
                <Sparkles size={32} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
                Generando {contentType === 'story' ? 'Historia' : 'Oraciones'} con Inteligencia Artificial...
              </h4>
              <p style={{ fontSize: '0.92rem', color: 'var(--primary)', fontWeight: 600, minHeight: 24, transition: 'all 0.3s' }}>
                ⚡ {loadingMessages[loadingStep]}
              </p>
              <div style={{ maxWidth: 360, height: 6, background: 'var(--border)', borderRadius: 999, margin: '24px auto 0', overflow: 'hidden' }}>
                <div style={{
                  width: `${(loadingStep + 1) * 25}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          )}

          {/* RESULT: STORY VIEW */}
          {resultStory && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                    <span className="vocab-tag">{resultStory.difficulty || level}</span>
                    <span className="vocab-tag" style={{ background: 'var(--primary-bg, rgba(99, 102, 241, 0.1))', color: 'var(--primary)' }}>
                      {effectiveTheme.slice(0, 25)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {resultStory.sentences?.length || 0} oraciones
                    </span>
                  </div>
                  <h3 className="jp-text" style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-main)' }}>
                    {resultStory.title}
                  </h3>
                  <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                    {resultStory.title_en}
                  </div>
                </div>

                {/* Reading mode toggles */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    type="button"
                    className={`btn ${readingMode === 'natural' ? 'btn-primary' : 'btn-outline'} btn-xs`}
                    onClick={() => setReadingMode('natural')}
                  >
                    Furigana
                  </button>
                  <button
                    type="button"
                    className={`btn ${readingMode === 'kanji_only' ? 'btn-primary' : 'btn-outline'} btn-xs`}
                    onClick={() => setReadingMode('kanji_only')}
                  >
                    Solo Kanji
                  </button>
                  <button
                    type="button"
                    className={`btn ${readingMode === 'hiragana' ? 'btn-primary' : 'btn-outline'} btn-xs`}
                    onClick={() => setReadingMode('hiragana')}
                  >
                    Kana
                  </button>
                </div>
              </div>

              {/* Story Description */}
              {resultStory.description && (
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 16, fontStyle: 'italic' }}>
                  📝 {resultStory.description}
                </div>
              )}

              {/* Paragraphs Presentation */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Texto Completo:</span>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => {
                      const fullText = (resultStory.paragraphs || []).map(p => p.japanese).join(' ');
                      audioManager.speak(fullText);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--primary)', borderColor: 'var(--primary)' }}
                  >
                    <Volume2 size={15} />
                    <span>Escuchar Historia</span>
                  </button>
                </div>

                {(resultStory.paragraphs || []).map((p, idx) => (
                  <div key={idx} style={{ marginBottom: 14 }}>
                    {renderRubyParagraph(p)}
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 8, borderTop: '1px dashed var(--border)', paddingTop: 6 }}>
                      {p.english}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sentences Breakdown */}
              {resultStory.sentences && resultStory.sentences.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 10 }}>
                    Desglose de Oraciones y Gramática:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {resultStory.sentences.map((sent, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          padding: 12
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ flex: 1 }}>
                            <div className="jp-text" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                              {sent.japanese}
                            </div>
                            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                              {sent.english}
                            </div>
                            {sent.grammar_note && (
                              <div style={{
                                fontSize: '0.82rem',
                                color: 'var(--primary)',
                                background: 'var(--primary-bg, rgba(99, 102, 241, 0.08))',
                                padding: '4px 8px',
                                borderRadius: 6,
                                display: 'inline-block'
                              }}>
                                💡 {sent.grammar_note}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            className="audio-btn"
                            style={{ width: 32, height: 32, flexShrink: 0 }}
                            onClick={() => audioManager.speak(sent.japanese)}
                            title="Escuchar oración"
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3 Reading Comprehension Questions for Story */}
              {resultStory.comprehension_questions && resultStory.comprehension_questions.length > 0 && (
                <ComprehensionQuiz
                  questions={resultStory.comprehension_questions}
                  appState={appState}
                  onUpdateState={onUpdateState}
                  title="Preguntas de Comprensión de la Historia"
                  subtitle="Comprueba tu nivel de lectura y comprensión del relato respondiendo estas 3 preguntas:"
                />
              )}
            </div>
          )}

          {/* RESULT: CONVERSATION VIEW */}
          {resultConversation && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                    <span className="vocab-tag">{resultConversation.level || level}</span>
                    <span className="vocab-tag" style={{ background: 'var(--primary-bg, rgba(99, 102, 241, 0.1))', color: 'var(--primary)' }}>
                      {effectiveTheme.slice(0, 25)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {resultConversation.dialogue?.length || 0} turnos de diálogo
                    </span>
                  </div>
                  <h3 className="jp-text" style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-main)' }}>
                    {resultConversation.title_jp}
                  </h3>
                  <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                    {resultConversation.title_es}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const playlist = (resultConversation.dialogue || []).map(d => ({
                        text: d.jp,
                        desc: `${d.speaker}: ${d.es}`
                      }));
                      audioManager.setPlaylist(playlist, 0);
                      if (playlist.length > 0) audioManager.speak(playlist[0].text, { autoAdvance: true });
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Volume2 size={16} />
                    <span>Reproducir Diálogo</span>
                  </button>
                </div>
              </div>

              {/* Target Words chips */}
              {selectedItems.length > 0 && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Elementos incluidos:</span>
                  {selectedItems.map((item, idx) => (
                    <span key={idx} className="vocab-tag" style={{ fontSize: '0.75rem' }}>
                      {item.text}
                    </span>
                  ))}
                </div>
              )}

              {/* Dialogue Lines Presentation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {(resultConversation.dialogue || []).map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12
                    }}
                  >
                    <div style={{ minWidth: 80, fontWeight: 700, color: 'var(--accent)', paddingTop: 2, fontSize: '0.9rem' }}>
                      {line.speaker}:
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="jp-text" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                        {line.jp}
                      </div>
                      {line.kana && line.kana !== line.jp && (
                        <div className="jp-text" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                          {line.kana}
                        </div>
                      )}
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        🇪🇸 {line.es}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="audio-btn"
                      style={{ width: 32, height: 32, flexShrink: 0 }}
                      onClick={() => audioManager.speak(line.jp)}
                      title="Escuchar réplica"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Grammar Notes */}
              {resultConversation.grammar_notes && resultConversation.grammar_notes.length > 0 && (
                <div style={{ background: 'var(--primary-bg, rgba(99, 102, 241, 0.08))', borderLeft: '4px solid var(--primary)', padding: '16px 18px', borderRadius: '0 12px 12px 0', marginBottom: 20 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={16} /> Notas Gramaticales del Diálogo:
                  </h4>
                  <ul style={{ listStyleType: 'disc', paddingLeft: 20, margin: 0, fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                    {resultConversation.grammar_notes.map((note, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 3 Reading Comprehension Questions for Conversation */}
              {resultConversation.comprehension_questions && resultConversation.comprehension_questions.length > 0 && (
                <ComprehensionQuiz
                  questions={resultConversation.comprehension_questions}
                  appState={appState}
                  onUpdateState={onUpdateState}
                  title="Preguntas de Comprensión del Diálogo"
                  subtitle="Verifica tu comprensión auditiva y lectora respondiendo estas 3 preguntas sobre la conversación:"
                />
              )}
            </div>
          )}

          {/* RESULT: SENTENCES VIEW */}
          {resultSentences && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                    <span className="vocab-tag">{level}</span>
                    <span className="vocab-tag" style={{ background: 'var(--primary-bg, rgba(99, 102, 241, 0.1))', color: 'var(--primary)' }}>
                      {effectiveTheme.slice(0, 25)}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {resultSentences.length} Oraciones de Ejemplo Generadas
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleCopyText}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    {copiedSuccess ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    <span>{copiedSuccess ? 'Copiadas' : 'Copiar'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveAllSentences}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <BookmarkCheck size={15} />
                    <span>Guardar Todas (+{resultSentences.length * 15} XP)</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {resultSentences.map((sent, idx) => {
                  const isSaved = savedSentenceIds.has(sent.id || idx);
                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        padding: 16,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            #{idx + 1}
                          </span>
                          {sent.target && (
                            <span style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background: 'rgba(99, 102, 241, 0.12)',
                              color: 'var(--primary)',
                              padding: '2px 8px',
                              borderRadius: 12,
                              border: '1px solid rgba(99, 102, 241, 0.25)'
                            }}>
                              🎯 Objetivo: <span className="jp-text">{sent.target}</span>
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            className="audio-btn"
                            style={{ width: 34, height: 34 }}
                            onClick={() => audioManager.speak(sent.japanese)}
                            title="Escuchar pronunciación"
                          >
                            <Volume2 size={17} />
                          </button>
                          <button
                            type="button"
                            className={`btn ${isSaved ? 'btn-primary' : 'btn-outline'} btn-xs`}
                            onClick={() => handleSaveSentence(sent, idx)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            title="Guardar en cuaderno de frases"
                          >
                            {isSaved ? <Check size={13} /> : <BookmarkCheck size={13} />}
                            <span>{isSaved ? 'Guardada' : 'Guardar'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Japanese Sentence */}
                      <div className="jp-text" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6, lineHeight: 1.5 }}>
                        {sent.japanese}
                      </div>

                      {/* Furigana / Kana */}
                      {sent.furigana && (
                        <div className="jp-text" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                          {sent.furigana}
                        </div>
                      )}

                      {/* Spanish Translation */}
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: 10, fontWeight: 500 }}>
                        🇪🇸 {sent.translation}
                      </div>

                      {/* Grammar Note */}
                      {sent.grammar_note && (
                        <div style={{
                          fontSize: '0.84rem',
                          color: 'var(--amber-700, #b45309)',
                          background: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          borderRadius: 8,
                          padding: '6px 10px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 6
                        }}>
                          <Lightbulb size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                          <div>{sent.grammar_note}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          {/* Left info or reset */}
          <div>
            {(resultStory || resultSentences || resultConversation) ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setResultStory(null);
                  setResultSentences(null);
                  setResultConversation(null);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}
              >
                <RefreshCw size={14} />
                <span>Configurar otra generación</span>
              </button>
            ) : (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Powered by Groq AI Neuronal · Llama 3 / Qwen
              </span>
            )}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onClose}
            >
              Cerrar
            </button>

            {!resultStory && !resultSentences && !resultConversation && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleGenerate}
                disabled={isGenerating || selectedItems.length === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 18px',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
                }}
              >
                <Sparkles size={16} />
                <span>{!authUser ? '🔒 Inicia sesión para Generar' : (contentType === 'story' ? 'Generar Historia con IA' : contentType === 'conversation' ? 'Generar Diálogo con IA' : 'Generar Oraciones con IA')}</span>
              </button>
            )}

            {resultConversation && (
              <>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleCopyText}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  {copiedSuccess ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  <span>{copiedSuccess ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleSaveConversation(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#10b981', borderColor: '#10b981' }}
                >
                  <BookmarkCheck size={15} />
                  <span>{savedSuccess ? 'Guardada' : 'Guardar en Diálogos (+50 XP)'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSaveConversation(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, background: '#10b981', borderColor: '#10b981' }}
                >
                  <PlayCircle size={16} />
                  <span>Abrir en Diálogos</span>
                </button>
              </>
            )}

            {resultStory && (
              <>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleCopyText}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  {copiedSuccess ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  <span>{copiedSuccess ? 'Copiada' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleSaveStory(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--primary)', borderColor: 'var(--primary)' }}
                >
                  <BookmarkCheck size={15} />
                  <span>{savedSuccess ? 'Guardada' : 'Guardar en Historias (+50 XP)'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSaveStory(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <PlayCircle size={16} />
                  <span>Abrir en Modo Historia</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
