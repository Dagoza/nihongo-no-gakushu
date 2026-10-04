'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Volume2, 
  BookOpen, 
  BookmarkCheck, 
  Check, 
  Copy, 
  Plus, 
  Trash2, 
  Play, 
  User, 
  Users,
  Lightbulb
} from 'lucide-react';
import audioManager from '../lib/audioManager';
import { getAuthSession } from '../lib/supabaseSync';
import { useApp } from '../lib/AppContext';
import ComprehensionQuiz from './ComprehensionQuiz';
import * as wanakana from 'wanakana';
import { getSpeakerVoice, getSpeakerStyle } from './ConversationTab';

export const CONVERSATION_CATEGORIES = [
  { id: 'food', label: 'Comida & Restaurantes', icon: '🍱', prompt: 'Pidiendo en un restaurante japonés, preguntando por platos e ingredientes' },
  { id: 'transport', label: 'Estación & Trenes', icon: '🚆', prompt: 'Comprando billetes de tren, preguntando por andenes y transbordos' },
  { id: 'shopping', label: 'Compras & Tiendas', icon: '🛍️', prompt: 'Preguntando precios, tallas y pagando en una tienda en Tokio' },
  { id: 'hotel', label: 'Hotel & Alojamiento', icon: '🏨', prompt: 'Check-in en un ryokan u hotel, pidiendo servicios y horarios' },
  { id: 'school', label: 'Escuela & Estudio', icon: '🏫', prompt: 'Conversando con un compañero o profesor sobre clases y tareas' },
  { id: 'friendship', label: 'Presentaciones & Amistad', icon: '🌸', prompt: 'Conociendo a alguien por primera vez, hablando de pasatiempos y origen' },
  { id: 'work', label: 'Trabajo & Cortesía', icon: '💼', prompt: 'Saludo formal en la oficina, avisando de retrasos o reuniones' },
  { id: 'custom', label: 'Tema Personalizado', icon: '✏️', prompt: '' }
];

export default function ConversationGeneratorModal({
  isOpen,
  onClose,
  initialWords = [],
  defaultLevel = 'N5',
  appState,
  onUpdateState,
  onSelectConversation,
  authUser: propAuthUser = null
}) {
  let contextApp = null;
  try {
    contextApp = useApp();
  } catch (e) {}

  const authUser = propAuthUser || contextApp?.authUser;
  const showAlert = contextApp?.showAlert || ((opts) => alert(opts.message || opts.title));

  const [selectedWords, setSelectedWords] = useState([]);
  const [newWordInput, setNewWordInput] = useState('');
  const [level, setLevel] = useState(defaultLevel === 'all' ? 'N5' : defaultLevel);
  const [selectedCatId, setSelectedCatId] = useState('food');
  const [customTheme, setCustomTheme] = useState('');
  const [characterA, setCharacterA] = useState('健二 (Kenji)');
  const [characterB, setCharacterB] = useState('Elena (Estudiante)');
  const [lineCount, setLineCount] = useState(8);

  // Results state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConv, setGeneratedConv] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialWords && initialWords.length > 0) {
        setSelectedWords(initialWords.map(w => typeof w === 'string' ? w : (w.kanji || w.text || w.char || '')));
      }
      if (defaultLevel && defaultLevel !== 'all') {
        setLevel(defaultLevel);
      }
      setGeneratedConv(null);
      setSavedSuccess(false);
    }
  }, [isOpen, initialWords, defaultLevel]);

  const handleAddWord = () => {
    const trimmed = newWordInput.trim();
    if (!trimmed) return;
    if (!selectedWords.includes(trimmed)) {
      setSelectedWords(prev => [...prev, trimmed]);
    }
    setNewWordInput('');
  };

  const handleRemoveWord = (word) => {
    setSelectedWords(prev => prev.filter(w => w !== word));
  };

  const effectiveTheme = selectedCatId === 'custom' 
    ? (customTheme.trim() || 'Conversación cotidiana en Japón')
    : (CONVERSATION_CATEGORIES.find(c => c.id === selectedCatId)?.prompt || 'Comida & Restaurantes');

  const handleGenerate = async () => {
    // 1. Requerir sesión activa para interactuar con la IA
    if (!authUser) {
      showAlert({
        type: 'lock',
        title: 'Generador de Diálogos con IA',
        message: 'Debes iniciar sesión con tu cuenta de Google o correo para generar diálogos situacionales con Inteligencia Artificial.',
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

    setIsGenerating(true);
    setGeneratedConv(null);
    setSavedSuccess(false);

    try {
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
        action: 'generate_dialogue',
        items: selectedWords,
        level,
        theme: effectiveTheme,
        category: CONVERSATION_CATEGORIES.find(c => c.id === selectedCatId)?.label || 'General',
        count: lineCount,
        characters: [characterA.trim() || 'Persona A', characterB.trim() || 'Persona B']
      };

      const response = await fetch('/api/conversations/generate', {
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
          message: data.error || 'No se pudo generar el diálogo con el servicio de IA.',
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

      setGeneratedConv(data.conversation);
    } catch (err) {
      console.error('Error generating conversation:', err);
      showAlert({
        type: 'error',
        title: 'Error de Red',
        message: 'Ocurrió un error al contactar con el servidor de IA.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveConversation = () => {
    if (!generatedConv) return;

    const newConv = {
      id: `conv_custom_${Date.now()}`,
      title_jp: generatedConv.title_jp || '会話 (Conversación con IA)',
      title_es: generatedConv.title_es || effectiveTheme,
      level: generatedConv.level || level,
      topic: generatedConv.topic || effectiveTheme,
      characters: generatedConv.characters || [characterA, characterB],
      dialogue: generatedConv.dialogue || [],
      grammar_notes: generatedConv.grammar_notes || [],
      comprehension_questions: generatedConv.comprehension_questions || [],
      words_used: generatedConv.vocabulary_used || selectedWords,
      createdAt: new Date().toISOString(),
      isCustom: true,
      source: 'Generador IA'
    };

    const prevList = appState?.savedConversations || [];
    const updated = [newConv, ...prevList];
    const newXp = (appState?.xp || 0) + 50;

    onUpdateState({
      ...appState,
      savedConversations: updated,
      xp: newXp
    });

    setSavedSuccess(true);
    showAlert({
      type: 'success',
      title: '¡Conversación Guardada! (+50 XP)',
      message: 'El diálogo se ha guardado en tu cuenta y en Supabase para tenerlo disponible siempre.'
    });

    if (onSelectConversation) {
      onSelectConversation(newConv);
      onClose();
    }
  };

  const handleCopy = () => {
    if (!generatedConv) return;
    const text = `${generatedConv.title_jp} (${generatedConv.title_es})\n\n` +
      generatedConv.dialogue.map(d => `${d.speaker}:\n  ${d.jp}\n  ${d.kana}\n  ${d.es}`).join('\n\n') +
      '\n\nNotas Gramaticales:\n' +
      (generatedConv.grammar_notes || []).map(n => `- ${n}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="conv-modal-backdrop" onClick={onClose}>
      <div 
        className="conv-modal-window" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="conv-modal-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
              flexShrink: 0,
              marginTop: 2
            }}>
              <Sparkles size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                Generador de Diálogos con IA
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                Crea conversaciones situacionales regulando palabras objetivo, nivel y temática.
              </p>
            </div>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: 2 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="conv-modal-body">
          
          {/* Auth requirement notice */}
          {!authUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              background: 'rgba(236, 72, 153, 0.08)',
              border: '1px solid rgba(236, 72, 153, 0.25)',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200 }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🔒</span>
                <span style={{ lineHeight: 1.35 }}>
                  Para generar diálogos con IA debes <strong>iniciar sesión</strong> con tu cuenta.
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
                style={{
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  padding: '7px 14px'
                }}
              >
                Iniciar Sesión
              </button>
            </div>
          )}

          {!generatedConv && !isGenerating && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', boxSizing: 'border-box' }}>
              
              {/* Words / Vocab selection */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, boxSizing: 'border-box' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  1. Palabras o vocabulario a incluir (opcional):
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {selectedWords.map((w, idx) => (
                    <span 
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'rgba(236, 72, 153, 0.12)',
                        border: '1px solid rgba(236, 72, 153, 0.3)',
                        color: '#ec4899',
                        padding: '3px 9px',
                        borderRadius: 20,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        maxWidth: '100%',
                        wordBreak: 'break-word'
                      }}
                    >
                      <span className="jp-text">{w}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWord(w)}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                        aria-label={`Eliminar palabra ${w}`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  {selectedWords.length === 0 && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.35 }}>
                      Sin palabras específicas (la IA usará vocabulario natural según el nivel).
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                  <input
                    type="text"
                    className="search-input jp-text"
                    placeholder="Palabra o kanji (ej: taberu → 食べる)..."
                    value={newWordInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      const converted = wanakana.toKana(val, { IMEMode: true });
                      setNewWordInput(converted);
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData?.getData('text');
                      if (pasted && /[a-zA-Z]/.test(pasted)) {
                        e.preventDefault();
                        const converted = wanakana.toKana(pasted);
                        setNewWordInput(prev => prev + converted);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddWord();
                      }
                    }}
                    style={{ flex: 1, minWidth: 0, padding: '8px 12px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleAddWord}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, padding: '0 14px', whiteSpace: 'nowrap' }}
                  >
                    <Plus size={15} />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

              {/* Level Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  2. Nivel JLPT:
                </label>
                <div className="conv-level-grid">
                  {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`btn ${level === lvl ? 'btn-primary' : 'btn-outline'} btn-sm`}
                      onClick={() => setLevel(lvl)}
                      style={{
                        padding: '7px 4px',
                        borderRadius: 8,
                        fontWeight: 700,
                        width: '100%',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        ...(level === lvl ? { background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', borderColor: '#ec4899', color: '#fff' } : {})
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category & Topic */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  3. Tema y contexto de la conversación:
                </label>
                <div className="conv-categories-grid">
                  {CONVERSATION_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCatId(cat.id)}
                      className="conv-category-btn"
                      style={{
                        border: selectedCatId === cat.id ? '2px solid #ec4899' : '1px solid var(--border)',
                        background: selectedCatId === cat.id ? 'rgba(236, 72, 153, 0.12)' : 'var(--surface)',
                        color: selectedCatId === cat.id ? '#ec4899' : 'var(--text-main)',
                        fontWeight: selectedCatId === cat.id ? 700 : 500,
                      }}
                    >
                      <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{cat.icon}</span>
                      <span className="conv-category-label">{cat.label}</span>
                    </button>
                  ))}
                </div>

                {selectedCatId === 'custom' && (
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Escribe la situación que deseas (ej: 'En el médico por dolor de garganta')..."
                      value={customTheme}
                      onChange={(e) => setCustomTheme(e.target.value)}
                      style={{ width: '100%', minWidth: 0, padding: '8px 12px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                  </div>
                )}
              </div>

              {/* Characters & Length */}
              <div className="conv-characters-grid">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5 }}>
                    Personaje 1:
                  </label>
                  <input
                    type="text"
                    className="search-input"
                    value={characterA}
                    onChange={(e) => setCharacterA(e.target.value)}
                    style={{ width: '100%', minWidth: 0, padding: '8px 10px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5 }}>
                    Personaje 2:
                  </label>
                  <input
                    type="text"
                    className="search-input"
                    value={characterB}
                    onChange={(e) => setCharacterB(e.target.value)}
                    style={{ width: '100%', minWidth: 0, padding: '8px 10px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

            </div>
          )}

          {/* Loading */}
          {isGenerating && (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <div style={{
                width: 60,
                height: 60,
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                animation: 'pulse 1.6s infinite ease-in-out',
                boxShadow: '0 8px 24px rgba(236, 72, 153, 0.4)'
              }}>
                <Sparkles size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
                Generando Diálogo en Japonés Natural...
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#ec4899', fontWeight: 600, margin: 0 }}>
                ⚡ Calibrando nivel {level} y tejiendo turnos conversacionales con audio...
              </p>
            </div>
          )}

          {/* Result Preview */}
          {generatedConv && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 'min(200px, 100%)' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span className="vocab-tag">{generatedConv.level || level}</span>
                    <span className="vocab-tag" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.25)' }}>
                      {generatedConv.topic}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {generatedConv.dialogue?.length || 0} líneas
                    </span>
                  </div>
                  <h3 className="jp-text" style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-main)', wordBreak: 'break-word', lineHeight: 1.3 }}>
                    {generatedConv.title_jp}
                  </h3>
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)', wordBreak: 'break-word' }}>
                    {generatedConv.title_es}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-xs conv-play-all-btn"
                  onClick={() => {
                    const playlist = (generatedConv.dialogue || []).map((d, idx) => ({ 
                      text: d.jp, 
                      desc: `${d.speaker}: ${d.es}`,
                      voice: getSpeakerVoice(d.speaker, idx)
                    }));
                    audioManager.setPlaylist(playlist, 0);
                    if (playlist.length > 0) audioManager.speak(playlist[0].text, { voice: playlist[0].voice, autoAdvance: true });
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#ec4899', borderColor: '#ec4899', flexShrink: 0 }}
                >
                  <Volume2 size={14} />
                  <span>Reproducir Diálogo Completo</span>
                </button>
              </div>

              {/* Dialogue Lines */}
              <div className="dialogue-chat-stream" style={{ marginBottom: 12 }}>
                {(generatedConv.dialogue || []).map((d, idx) => {
                  const spkStyle = getSpeakerStyle(d.speaker, false, generatedConv.speakers || []);
                  const isSecondSpeaker = idx % 2 === 1;
                  return (
                    <div
                      key={idx}
                      className={`dialogue-card-item dialogue-chat-bubble ${isSecondSpeaker ? 'bubble-right' : 'bubble-left'}`}
                      style={{ background: 'var(--surface)', padding: '12px 14px' }}
                    >
                      <div className="dialogue-card-header">
                        <div className="dialogue-speaker-wrap">
                          <div 
                            className="dialogue-speaker-pill"
                            style={{
                              background: spkStyle.pillBg,
                              borderColor: spkStyle.pillBorder,
                              color: spkStyle.color
                            }}
                          >
                            <span 
                              className="dialogue-speaker-avatar"
                              style={{
                                background: spkStyle.iconBg,
                                color: spkStyle.color
                              }}
                            >
                              <User size={12} />
                            </span>
                            <span>{d.speaker}</span>
                          </div>
                        </div>

                        <div className="dialogue-card-actions">
                          <button
                            type="button"
                            className="audio-btn"
                            onClick={() => audioManager.speak(d.jp, { voice: getSpeakerVoice(d.speaker, idx) })}
                            title="Escuchar línea"
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="dialogue-card-body">
                        <div className="dialogue-card-jp jp-text" style={{ fontSize: '1.18rem' }}>
                          {d.jp}
                        </div>
                        {d.kana && (
                          <div className="dialogue-card-kana jp-text">
                            {d.kana}
                          </div>
                        )}
                        <div className="dialogue-card-es">
                          <span style={{ marginRight: 6 }}>🇪🇸</span>
                          <span>{d.es}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grammar Notes */}
              {generatedConv.grammar_notes && generatedConv.grammar_notes.length > 0 && (
                <div style={{
                  background: 'rgba(236, 72, 153, 0.08)',
                  borderLeft: '4px solid #ec4899',
                  borderRadius: 8,
                  padding: '12px 14px',
                  marginBottom: 12,
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ec4899', fontWeight: 700, fontSize: '0.88rem', marginBottom: 6 }}>
                    <Lightbulb size={16} />
                    <span>Puntos Clave de Gramática:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', lineHeight: 1.6, wordBreak: 'break-word' }}>
                    {generatedConv.grammar_notes.map((gn, idx) => (
                      <li key={idx} style={{ marginBottom: 3 }}>{gn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 3 Reading Comprehension Questions for Conversation */}
              {generatedConv.comprehension_questions && generatedConv.comprehension_questions.length > 0 && (
                <ComprehensionQuiz
                  questions={generatedConv.comprehension_questions}
                  appState={appState}
                  onUpdateState={onUpdateState}
                  title="Preguntas de Comprensión del Diálogo"
                  subtitle="Verifica tu comprensión auditiva y lectora respondiendo estas 3 preguntas sobre la conversación:"
                />
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="conv-modal-footer">
          <div className="conv-footer-brand">
            {generatedConv ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setGeneratedConv(null)}
                style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '6px 10px' }}
              >
                ← Volver a configurar
              </button>
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span>⚡</span> Powered by Groq AI Neuronal
              </span>
            )}
          </div>

          <div className="conv-footer-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm conv-btn-close"
              onClick={onClose}
            >
              Cerrar
            </button>

            {!generatedConv ? (
              <button
                type="button"
                className="btn btn-primary btn-sm conv-btn-primary"
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  borderColor: '#ec4899'
                }}
              >
                <Sparkles size={16} />
                <span>{!authUser ? '🔒 Inicia sesión para Generar' : 'Generar Diálogo con IA'}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-outline btn-sm conv-btn-copy"
                  onClick={handleCopy}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                >
                  {copiedSuccess ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  <span>{copiedSuccess ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm conv-btn-save"
                  onClick={handleSaveConversation}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                    borderColor: '#ec4899'
                  }}
                >
                  <BookmarkCheck size={16} />
                  <span>{savedSuccess ? 'Guardada' : 'Guardar en Supabase (+50 XP)'}</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
