'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  RotateCcw, 
  BookmarkCheck, 
  Lightbulb, 
  User, 
  Bot, 
  Check, 
  Copy, 
  RefreshCw,
  HelpCircle,
  PlayCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import audioManager from '../lib/audioManager';
import { getAuthSession } from '../lib/supabaseSync';
import { useApp } from '../lib/AppContext';
import * as wanakana from 'wanakana';

export const ROLEPLAY_SCENARIOS = [
  {
    id: 'cafe',
    title: 'En la Cafetería',
    icon: '☕',
    level: 'N5',
    aiRole: '店員 (Mesero)',
    userRole: '客 (Cliente)',
    scenario: 'Estás en una cafetería en Shibuya pidiendo café y un postre.',
    initialAiMessage: 'いらっしゃいませ！何名様ですか。何をご注文なさいますか。',
    initialAiKana: 'いらっしゃいませ！なんめいさまですか。なにをごちゅうもんなさいますか。',
    initialAiEs: '¡Bienvenido! ¿Cuántas personas son? ¿Qué desea pedir?'
  },
  {
    id: 'station',
    title: 'En la Estación de Tren',
    icon: '🚆',
    level: 'N5',
    aiRole: '駅員 (Empleado de estación)',
    userRole: '乗客 (Pasajero)',
    scenario: 'Estás en la estación de Tokio buscando el andén hacia Kioto o Shinjuku.',
    initialAiMessage: 'はい、どうなさいましたか。どちらへ行かれますか。',
    initialAiKana: 'はい、どうなさいましたか。どちらへいかれますか。',
    initialAiEs: 'Sí, ¿en qué puedo ayudarle? ¿Hacia dónde se dirige?'
  },
  {
    id: 'restaurant',
    title: 'En el Restaurante Izakaya',
    icon: '🍱',
    level: 'N4',
    aiRole: '店長 (Encargado)',
    userRole: '客 (Comensal)',
    scenario: 'Pides mesa, pides platos típicos y preguntas por la especialidad del día.',
    initialAiMessage: 'いらっしゃい！何名ですか。今日のおすすめは焼き鳥と刺身だよ。',
    initialAiKana: 'いらっしゃい！なんめいですか。きょうのおすすめはやきとりとさしみだよ。',
    initialAiEs: '¡Buenas! ¿Cuántas personas son? La recomendación de hoy es yakitori y sashimi.'
  },
  {
    id: 'hotel',
    title: 'Check-in en el Hotel',
    icon: '🏨',
    level: 'N4',
    aiRole: 'フロント (Recepcionista)',
    userRole: '宿泊客 (Huésped)',
    scenario: 'Llegas a tu hotel en Kioto para registrarte y preguntas sobre el desayuno y wifi.',
    initialAiMessage: 'こんばんは。ホテル京都へようこそ。ご予約のお名前を伺えますか。',
    initialAiKana: 'こんばんは。ほてるきょうとへようこそ。ごよやくのおなまえをうかがえますか。',
    initialAiEs: 'Buenas noches. Bienvenido al Hotel Kyoto. ¿Me permite su nombre de reserva?'
  },
  {
    id: 'friend',
    title: 'Planes con un Amigo',
    icon: '🌸',
    level: 'N4',
    aiRole: '健二 (Amigo Kenji)',
    userRole: '友達 (Amigo/a)',
    scenario: 'Un amigo japonés te saluda y te propone salir este fin de semana.',
    initialAiMessage: 'やあ！今週末、何か予定ある？一緒に映画かカラオケに行かない？',
    initialAiKana: 'やあ！こんしゅうまつ、なにかよていある？いっしょにえいがからおけにいかない？',
    initialAiEs: '¡Hola! ¿Tienes algún plan para este fin de semana? ¿Vamos al cine o al karaoke juntos?'
  },
  {
    id: 'custom',
    title: 'Escenario Libre / Personalizado',
    icon: '✏️',
    level: 'N5',
    aiRole: 'Interlocutor Japonés',
    userRole: 'Estudiante',
    scenario: 'Conversación en cualquier situación que desees practicar.',
    initialAiMessage: 'こんにちは！今日はどんなことについて話しましょうか。',
    initialAiKana: 'こんにちは！きょうはどんなことについてなしましょうか。',
    initialAiEs: '¡Hola! ¿De qué te gustaría que hablemos hoy?'
  }
];

const getBotVoice = (scenario) => {
  const role = (scenario?.aiRole || '').toLowerCase();
  if (role.includes('店員') || role.includes('カフェ') || role.includes('フロント') || role.includes('案内') || role.includes('sakura') || role.includes('anna') || role.includes('camarera')) {
    return 'ja-JP-NanamiNeural';
  }
  return 'ja-JP-KeitaNeural';
};

export default function RoleplayChat({ appState, onUpdateState, authUser: propAuthUser = null }) {
  let contextApp = null;
  try {
    contextApp = useApp();
  } catch (e) {}

  const authUser = propAuthUser || contextApp?.authUser;
  const showAlert = contextApp?.showAlert || ((opts) => alert(opts.message || opts.title));
  const showConfirm = contextApp?.showConfirm || (() => Promise.resolve(true));

  // Scenario config
  const [selectedScenarioId, setSelectedScenarioId] = useState('cafe');
  const [customScenarioText, setCustomScenarioText] = useState('');
  const [level, setLevel] = useState('N5');
  const [showFurigana, setShowFurigana] = useState(true);
  const [showSpanish, setShowSpanish] = useState(true);

  // Chat message history
  const activeScenario = ROLEPLAY_SCENARIOS.find(s => s.id === selectedScenarioId) || ROLEPLAY_SCENARIOS[0];
  const [messages, setMessages] = useState([]);
  
  // Student input draft state (review before sending)
  const [inputDraft, setInputDraft] = useState('');
  const [useIme, setUseIme] = useState(true);
  const isComposingRef = useRef(false);
  const [isDictating, setIsDictating] = useState(false);
  const [dictationSupported, setDictationSupported] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState([]);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Initialize Speech Recognition for Dictation
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (SpeechRecognition) {
      setDictationSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ja-JP';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsDictating(true);
        };

        recognition.onresult = (event) => {
          const currentTranscript = Array.from(event.results)
            .map((res) => res[0].transcript)
            .join('');
          setInputDraft((prev) => {
            // Append or replace
            return currentTranscript;
          });
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          setIsDictating(false);
        };

        recognition.onend = () => {
          setIsDictating(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        setDictationSupported(false);
      }
    }
  }, []);

  // Initialize or reset scenario
  const initScenario = (scenarioObj, currentLvl) => {
    const initialMsg = {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      speaker: scenarioObj.aiRole,
      jp: scenarioObj.initialAiMessage,
      kana: scenarioObj.initialAiKana,
      es: scenarioObj.initialAiEs,
      feedback: null
    };
    setMessages([initialMsg]);
    setInputDraft('');
    setSuggestedReplies([]);
    setSavedSuccess(false);
    audioManager.speak(scenarioObj.initialAiMessage);
  };

  useEffect(() => {
    initScenario(activeScenario, level);
  }, [selectedScenarioId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const toggleDictation = () => {
    if (!dictationSupported || !recognitionRef.current) {
      showAlert({
        type: 'warning',
        title: 'Micrófono no disponible',
        message: 'Tu navegador no soporta reconocimiento de voz nativo en japonés. Puedes escribir o pegar tu respuesta en el cuadro de texto.'
      });
      return;
    }

    if (isDictating) {
      recognitionRef.current.stop();
      setIsDictating(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const handleSendDraft = async () => {
    const textToSend = inputDraft.trim();
    if (!textToSend || isSending) return;

    // 1. Requerir sesión activa para conversar con la IA
    if (!authUser) {
      showAlert({
        type: 'lock',
        title: 'Práctica Conversacional con IA',
        message: 'Debes iniciar sesión con tu cuenta de Google o correo para interactuar en tiempo real y recibir correcciones didácticas del interlocutor IA.',
        actionLabel: 'Iniciar Sesión',
        onAction: () => {
          if (contextApp?.setIsAuthModalOpen) {
            contextApp.setIsAuthModalOpen(true);
          }
        }
      });
      return;
    }

    // Add student message to history
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      speaker: activeScenario.userRole,
      jp: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputDraft('');
    setIsSending(true);

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
            if (contextApp?.setIsAuthModalOpen) {
              contextApp.setIsAuthModalOpen(true);
            }
          }
        });
        // Deshacer mensaje añadido si falló por falta de sesión
        setMessages(messages);
        setInputDraft(textToSend);
        setIsSending(false);
        return;
      }

      const scenarioText = selectedScenarioId === 'custom' 
        ? (customScenarioText.trim() || activeScenario.scenario) 
        : activeScenario.scenario;

      const response = await fetch('/api/conversations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          action: 'roleplay_turn',
          scenario: scenarioText,
          level,
          characterName: activeScenario.aiRole,
          userRole: activeScenario.userRole,
          history: newHistory.map(m => ({ speaker: m.speaker, jp: m.jp, es: m.es || '' })),
          userMessage: textToSend
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        showAlert({
          type: 'error',
          title: 'Error de Respuesta IA',
          message: data.error || 'No se pudo obtener la respuesta del interlocutor.',
          actionLabel: response.status === 401 ? 'Iniciar Sesión' : undefined,
          onAction: response.status === 401 ? () => {
            if (contextApp?.setIsAuthModalOpen) {
              contextApp.setIsAuthModalOpen(true);
            }
          } : undefined
        });
        // Deshacer mensaje añadido si fue rechazado por 401
        if (response.status === 401) {
          setMessages(messages);
          setInputDraft(textToSend);
        }
        setIsSending(false);
        return;
      }

      const turn = data.turn;
      const aiReply = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        speaker: activeScenario.aiRole,
        jp: turn.reply_jp,
        kana: turn.reply_kana,
        es: turn.reply_es,
        feedback: turn.feedback,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiReply]);
      setSuggestedReplies(turn.suggested_replies || []);
      
      // Auto-play AI response
      audioManager.speak(turn.reply_jp);

    } catch (err) {
      console.error('Roleplay turn error:', err);
      showAlert({
        type: 'error',
        title: 'Error de Red',
        message: 'Ocurrió un error al contactar con el servicio de IA.'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Save the entire roleplay conversation to Supabase / savedConversations
  const handleSaveConversation = () => {
    if (messages.length < 2) {
      showAlert({
        type: 'warning',
        title: 'Conversación muy corta',
        message: 'Intercambia al menos un mensaje antes de guardar la conversación.'
      });
      return;
    }

    const dialogueLines = messages.map(m => ({
      speaker: m.speaker,
      jp: m.jp,
      kana: m.kana || m.jp,
      es: m.es || (m.sender === 'user' ? 'Línea del estudiante' : '')
    }));

    const scenarioText = selectedScenarioId === 'custom' 
      ? (customScenarioText.trim() || activeScenario.title)
      : activeScenario.title;

    const newConv = {
      id: `conv_roleplay_${Date.now()}`,
      title_jp: `${activeScenario.title} (Roleplay IA)`,
      title_es: `Práctica de conversación: ${scenarioText}`,
      level: level,
      topic: activeScenario.title,
      characters: [activeScenario.aiRole, activeScenario.userRole],
      dialogue: dialogueLines,
      grammar_notes: [
        `Roleplay simulado con IA enfocado en ${activeScenario.title} para nivel ${level}.`
      ],
      words_used: [],
      createdAt: new Date().toISOString(),
      isCustom: true,
      source: 'Roleplay IA'
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
      message: 'Esta conversación se ha guardado en tu cuenta y en Supabase para consultarla o repasarla en cualquier momento.'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Top Scenario & Configuration Bar */}
      <div className="card" style={{ padding: '16px 20px', borderRadius: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.6rem' }}>🎭</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Modo Roleplay Interactivo con IA
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Simula situaciones reales en Japón. Puedes dictar por voz o escribir en japonés y revisar tu texto antes de enviar.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Level selector */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Nivel:</span>
              {['N5', 'N4', 'N3', 'N2'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`btn btn-xs ${level === lvl ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setLevel(lvl)}
                  style={{ minWidth: 36, padding: '2px 8px', fontWeight: 700 }}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Save Conversation button */}
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSaveConversation}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 600 }}
              title="Guardar esta conversación en Supabase para tenerla disponible siempre"
            >
              <BookmarkCheck size={15} />
              <span>{savedSuccess ? 'Guardada' : 'Guardar Conversación (+50 XP)'}</span>
            </button>

            {/* Reset button */}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => initScenario(activeScenario, level)}
              style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              title="Reiniciar diálogo desde el principio"
            >
              <RotateCcw size={14} />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>

        {/* Scenarios Carousel / Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
          {ROLEPLAY_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => setSelectedScenarioId(sc.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                border: selectedScenarioId === sc.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: selectedScenarioId === sc.id ? 'var(--primary-bg, rgba(99, 102, 241, 0.12))' : 'var(--surface)',
                color: selectedScenarioId === sc.id ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: selectedScenarioId === sc.id ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{sc.icon}</span>
              <span>{sc.title}</span>
            </button>
          ))}
        </div>

        {selectedScenarioId === 'custom' && (
          <div style={{ marginTop: 10 }}>
            <input
              type="text"
              className="search-input"
              placeholder="Describe el escenario deseado (ej: 'Pedir indicaciones a un policía para llegar al templo Senso-ji')..."
              value={customScenarioText}
              onChange={(e) => setCustomScenarioText(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem' }}
            />
          </div>
        )}

        {/* Roles Context Badge */}
        <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span><strong>Escenario:</strong> {activeScenario.scenario}</span>
          <span>·</span>
          <span><strong>Interlocutor IA:</strong> {activeScenario.aiRole}</span>
          <span>·</span>
          <span><strong>Tu rol:</strong> {activeScenario.userRole}</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div 
        className="card" 
        style={{ 
          minHeight: 380, 
          maxHeight: 520, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 16,
          padding: '20px 22px',
          background: 'var(--bg-main)'
        }}
      >
        {/* Toggle Reading Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setShowFurigana(!showFurigana)}
            style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
          >
            {showFurigana ? '🙈 Ocultar Lectura Kana' : '👁️ Mostrar Lectura Kana'}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setShowSpanish(!showSpanish)}
            style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
          >
            {showSpanish ? '🙈 Ocultar Español' : '👁️ Mostrar Español'}
          </button>
        </div>

        {/* Message History */}
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isAi ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                alignSelf: isAi ? 'flex-start' : 'flex-end'
              }}
            >
              {/* Speaker Tag */}
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                {isAi ? <Bot size={13} color="var(--primary)" /> : <User size={13} color="var(--accent)" />}
                <span>{msg.speaker}</span>
                {msg.time && <span style={{ fontWeight: 400, opacity: 0.7 }}>· {msg.time}</span>}
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  background: isAi ? 'var(--surface)' : 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: isAi ? 'var(--text-main)' : '#fff',
                  border: isAi ? '1px solid var(--border)' : 'none',
                  borderRadius: isAi ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  padding: '14px 18px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  position: 'relative'
                }}
              >
                {/* Japanese Text */}
                <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.5, marginBottom: isAi ? 4 : 0 }}>
                  {msg.jp}
                </div>

                {/* Kana Reading */}
                {isAi && showFurigana && msg.kana && (
                  <div className="jp-text" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    {msg.kana}
                  </div>
                )}

                {/* Spanish Translation */}
                {isAi && showSpanish && msg.es && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border)', paddingTop: 6, marginTop: 4 }}>
                    🇪🇸 {msg.es}
                  </div>
                )}

                {/* Audio button for AI line */}
                {isAi && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                    <button
                      type="button"
                      className="audio-btn"
                      style={{ width: 28, height: 28 }}
                      onClick={() => audioManager.speak(msg.jp)}
                      title="Escuchar con voz natural"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Feedback Note if present */}
              {isAi && msg.feedback && (
                <div style={{
                  marginTop: 8,
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  color: 'var(--amber-700, #b45309)',
                  maxWidth: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6
                }}>
                  <Lightbulb size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Consejo del profesor:</strong> {msg.feedback}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: '0.88rem', fontStyle: 'italic', padding: '10px 0' }}>
            <Sparkles size={16} className="animate-spin" />
            <span>{activeScenario.aiRole} está respondiendo en japonés...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested replies pills */}
      {suggestedReplies.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '4px 8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            💡 Sugerencias de respuesta (toca para usar y editar):
          </span>
          {suggestedReplies.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputDraft(sug)}
              className="jp-text"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: 'var(--text-main)',
                transition: 'all 0.15s ease'
              }}
              title="Cargar esta frase en tu borrador para revisarla antes de enviar"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Student Input & Review Section (Dictate/Type -> Review -> Send) */}
      <div 
        className="card" 
        style={{ 
          padding: '16px 20px', 
          borderRadius: 14,
          border: '1.5px solid var(--primary)',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.12)'
        }}
      >
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
            padding: '10px 14px',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
            marginBottom: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>🔒</span>
              <span>
                Para chatear en vivo con el interlocutor de IA debes <strong>iniciar sesión</strong> con tu cuenta.
              </span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => {
                if (contextApp?.setIsAuthModalOpen) {
                  contextApp.setIsAuthModalOpen(true);
                }
              }}
              style={{ whiteSpace: 'nowrap' }}
            >
              Iniciar Sesión
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
              ✍️ Tu borrador de respuesta (Revisar antes de enviar):
            </span>
            {/* IME toggle badge */}
            <button
              type="button"
              onClick={() => setUseIme(prev => !prev)}
              className={`btn btn-xs ${useIme ? 'btn-primary' : 'btn-outline'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.76rem',
                padding: '2px 8px',
                borderRadius: 12,
                fontWeight: 700
              }}
              title="Alternar conversión automática de Romaji a Hiragana/Katakana al escribir o pegar"
            >
              <span>🇯🇵 IME: {useIme ? 'ON (Romaji → Kana)' : 'OFF'}</span>
            </button>
            {isDictating && (
              <span style={{ 
                fontSize: '0.78rem', 
                background: 'var(--danger-bg, rgba(239, 68, 68, 0.15))', 
                color: 'var(--danger)', 
                padding: '2px 8px', 
                borderRadius: 12,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1s infinite' }} />
                Escuchando japonés...
              </span>
            )}
          </div>

          {/* Audio preview of draft */}
          {inputDraft.trim() && (
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => audioManager.speak(inputDraft.trim())}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary)' }}
              title="Escuchar cómo suena tu borrador antes de enviarlo"
            >
              <Volume2 size={14} />
              <span>Escuchar mi borrador</span>
            </button>
          )}
        </div>

        {/* Text Area with IME & Paste Support */}
        <textarea
          className="search-input jp-text"
          rows={3}
          placeholder={useIme ? "Escribe o pega en romaji o japonés (ej: 'hai, ko-hi- o hitotsu kudasai' → はい、コーヒーをひとつください)..." : "Escribe o dicta tu respuesta en japonés... (ej: 'はい、ホットコーヒーを一つください。')"}
          value={inputDraft}
          onChange={(e) => {
            const val = e.target.value;
            if (useIme && !isComposingRef.current) {
              const converted = wanakana.toKana(val, { IMEMode: true });
              setInputDraft(converted);
            } else {
              setInputDraft(val);
            }
          }}
          onPaste={(e) => {
            if (!useIme) return;
            const pastedText = e.clipboardData?.getData('text');
            if (!pastedText) return;
            // Si contiene caracteres latinos (romaji), convertir automáticamente a kana
            if (/[a-zA-Z]/.test(pastedText)) {
              e.preventDefault();
              const target = e.target;
              const start = target.selectionStart ?? inputDraft.length;
              const end = target.selectionEnd ?? inputDraft.length;
              const convertedPaste = wanakana.toKana(pastedText);
              const newVal = inputDraft.slice(0, start) + convertedPaste + inputDraft.slice(end);
              setInputDraft(newVal);
              requestAnimationFrame(() => {
                target.selectionStart = target.selectionEnd = start + convertedPaste.length;
              });
            }
          }}
          onCompositionStart={() => { isComposingRef.current = true; }}
          onCompositionEnd={() => { isComposingRef.current = false; }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) {
              e.preventDefault();
              handleSendDraft();
            }
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          style={{
            width: '100%',
            fontSize: '1.15rem',
            lineHeight: 1.5,
            padding: '12px 14px',
            borderRadius: 10,
            resize: 'vertical',
            marginBottom: 10
          }}
        />

        {/* Input Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Dictate Button */}
            <button
              type="button"
              className={`btn btn-sm ${isDictating ? 'btn-danger' : 'btn-outline'}`}
              onClick={toggleDictation}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                borderColor: isDictating ? 'var(--danger)' : '#ec4899',
                color: isDictating ? '#fff' : '#ec4899'
              }}
              title="Habla en japonés con tu micrófono para transcribir el texto al borrador"
            >
              {isDictating ? <MicOff size={16} /> : <Mic size={16} />}
              <span>{isDictating ? 'Detener Dictado' : 'Dictar por Voz'}</span>
            </button>

            {/* Clear draft */}
            {inputDraft && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setInputDraft('')}
                style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}
              >
                Limpiar borrador
              </button>
            )}

            {/* Convert to kana button if romaji detected */}
            {inputDraft && /[a-zA-Z]/.test(inputDraft) && (
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => setInputDraft(wanakana.toKana(inputDraft))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  color: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  fontSize: '0.78rem',
                  padding: '3px 8px'
                }}
                title="Convertir las letras romaji a caracteres japoneses kana"
              >
                <span>🇯🇵 Pasar a Kana</span>
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSendDraft}
            disabled={!inputDraft.trim() || isSending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 20px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Send size={15} />
            <span>{!authUser ? '🔒 Inicia sesión para Enviar' : 'Enviar Respuesta'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
