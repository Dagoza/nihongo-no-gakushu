'use client';

import React, { useState } from 'react';
import dataStore from '../lib/data';
import audioManager from '../lib/audioManager';
import { Volume2, CheckCircle2, Sparkles, BookOpen, HelpCircle } from 'lucide-react';

export default function StoryTab({ userState, onRecordActivity }) {
  const story = dataStore.stories[0];
  const [currentChapter, setCurrentChapter] = useState(1);
  const [readingMode, setReadingMode] = useState('natural'); // 'natural', 'hiragana', 'kanji_only'
  const [selectedSentenceId, setSelectedSentenceId] = useState('sent_1');
  const [typingInput, setTypingInput] = useState('');
  const [typingFeedback, setTypingFeedback] = useState(null);

  const chapter = story.paragraphs.find(p => p.chapter === currentChapter) || story.paragraphs[0];

  // Distribute sentences approximately
  const chapterRanges = {
    1: [0, 12],
    2: [12, 26],
    3: [26, 40],
    4: [40, 58]
  };
  const [start, end] = chapterRanges[currentChapter] || [0, 15];
  const chapterSentences = story.sentences.slice(start, end);
  const activeSentence = story.sentences.find(s => s.id === selectedSentenceId) || chapterSentences[0];

  const handlePlayChapter = () => {
    audioManager.setPlaylist(chapterSentences, 0);
    audioManager.speak(chapterSentences[0].japanese, { autoAdvance: true });
  };

  const handleSentenceClick = (sentence) => {
    setSelectedSentenceId(sentence.id);
    audioManager.speak(sentence.japanese);
  };

  const handleWordClick = (e, word) => {
    e.stopPropagation();
    audioManager.speak(word);
  };

  const handleCheckTyping = () => {
    if (!activeSentence) return;
    const cleanUser = typingInput.replace(/[、。！？「」\s]/g, '').trim();
    const cleanTarget = activeSentence.clean_target;

    if (!cleanUser) {
      setTypingFeedback({ type: 'warning', msg: 'Por favor escribe tu respuesta en japonés con tu teclado.' });
      return;
    }

    if (cleanUser === cleanTarget) {
      setTypingFeedback({ type: 'success', msg: '🎉 ¡Perfecto! Escritura en japonés completada correctamente (+30 XP).' });
      onRecordActivity(true, true, activeSentence.id);
      audioManager.speak(activeSentence.japanese);
    } else {
      setTypingFeedback({
        type: 'error',
        msg: `Casi lo tienes. Revisa caracteres o kanji. Tu entrada: "${typingInput}" vs Objetivo: "${activeSentence.japanese}"`
      });
      onRecordActivity(false, true);
    }
  };

  const handleHint = () => {
    if (!activeSentence) return;
    setTypingInput(activeSentence.japanese.slice(0, Math.ceil(activeSentence.japanese.length / 2)));
  };

  const renderRubyParagraph = (rawJp) => {
    const rubyMap = [
      ['私', 'わたし'], ['今年', 'ことし'], ['外国', 'がいこく'], ['来ました', 'きました'],
      ['国', 'くに'], ['遠い', 'とおい'], ['今日', 'きょう'], ['四月一日', 'しがつついたち'],
      ['月曜日', 'げつようび'], ['今', 'いま'], ['午前六時半', 'ごぜんろくじはん'],
      ['毎日', 'まいにち'], ['早く', 'はやく'], ['起きます', 'おきます'],
      ['天気', 'てんき'], ['良くて', 'よくて'], ['空', 'そら'], ['白い', 'しろい'],
      ['雲', 'くも'], ['少し', 'すこし'], ['青い', 'あおい'], ['外', 'そと'],
      ['寒い', 'さむい'], ['冷たい', 'つめたい'], ['水', 'みず'], ['顔', 'かお'],
      ['洗います', 'あらいます'], ['朝ごはん', 'あさごはん'], ['味', 'あじ'],
      ['美味しい', 'おいしい'], ['食べます', 'たべます'], ['父', 'ちち'],
      ['母', 'はは'], ['会社', 'かいしゃ'], ['行きました', 'いきました'],
      ['子供たち', 'こどもたち'], ['家', 'いえ'], ['学生', 'がくせい'],
      ['学校', 'がっこう'], ['駅', 'えき'], ['近い', 'ちかい'], ['電車', 'でんしゃ'],
      ['乗ります', 'のります'], ['道', 'みち'], ['長い', 'ながい'], ['大きい', 'おおきい'],
      ['木', 'き'], ['美しい', 'うつくしい'], ['花', 'はな'], ['男の子', 'おとこのこ'],
      ['女の子', 'おんなのこ'], ['立っています', 'たっています'], ['右', 'みぎ'],
      ['左', 'ひだり'], ['古い', 'ふるい'], ['店', 'みせ'], ['新しい', 'あたらしい'],
      ['小さい', 'ちいさい'], ['見えます', 'みえます'], ['大勢', 'おおぜい'],
      ['人', 'ひと'], ['速い', 'はやい'], ['多い', 'おおい'], ['八時', 'はちじ'],
      ['出て', 'でて'], ['入ります', 'はいります'], ['南口', 'みなみぐち'],
      ['友達', 'ともだち'], ['会いました', 'あいました'], ['彼女', 'かのじょ'],
      ['名前', 'なまえ'], ['元気', 'げんき'], ['言います', 'いいます'],
      ['日本語', 'にほんご'], ['勉強', 'べんきょう'], ['先生方', 'せんせいがた'],
      ['本', 'ほん'], ['机', 'つくえ'], ['出します', 'だします'],
      ['話', 'はなし'], ['聞いて', 'きいて'], ['読みます', 'よみます'],
      ['字', 'じ'], ['書きます', 'かきます'], ['易しくない', 'やすくない'],
      ['難しい', 'むずかしい'], ['漢字', 'かんじ'], ['読み方', 'よみかた'],
      ['何', 'なん'], ['聞きます', 'ききます'], ['授業', 'じゅぎょう'],
      ['面白い', 'おもしろい'], ['休み時間', 'やすみじかん'], ['午後十二時', 'ごごじゅうにじ'],
      ['皆', 'みな'], ['魚', 'さかな'], ['飲み物', 'のみもの'], ['買います', 'かいます'],
      ['お茶', 'おちゃ'], ['百五十円', 'ひゃくごじゅうえん'], ['全部', 'ぜんぶ'],
      ['千二百九十八円', 'せんにひゃくきゅうじゅうはちえん'], ['安い', 'やすい'],
      ['今週', 'こんしゅう'], ['土曜日', 'どようび'], ['日曜日', 'にちようび'],
      ['東', 'ひがし'], ['山', 'やま'], ['高い', 'たかい'], ['低い', 'ひくい'],
      ['空気', 'くうき'], ['楽しい', 'たのしい'], ['西', 'にし'], ['川', 'かわ'],
      ['足', 'あし'], ['入れる', 'いれる'], ['気持ち', 'きもち'],
      ['火曜日', 'かようび'], ['水曜日', 'すいようび'], ['木曜日', 'もくようび'],
      ['金曜日', 'きんようび'], ['忙しい', 'いそがしい'], ['休み', 'やすみ'],
      ['暑い', 'あつい'], ['飲んで', 'のんで'], ['お父さん', 'おとうさん'],
      ['三万円', 'さんまんえん'], ['車', 'くるま'], ['遅い', 'おそい'],
      ['北', 'きた'], ['黒い', 'くろい'], ['悪い', 'わるい'], ['雨', 'あめ'],
      ['目', 'め'], ['耳', 'みみ'], ['口', 'くち'], ['手', 'て'],
      ['五分', 'ごふん'], ['時間', 'じかん'], ['行きましょう', 'いきましょう']
    ];

    let html = rawJp;
    rubyMap.forEach(([k, r]) => {
      const reg = new RegExp(k, 'g');
      html = html.replace(reg, `<ruby class="ruby-clickable" data-word="${k}">${k}<rt>${r}</rt></ruby>`);
    });

    return (
      <div 
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={(e) => {
          const ruby = e.target.closest('ruby');
          if (ruby) {
            const word = ruby.getAttribute('data-word') || ruby.innerText;
            handleWordClick(e, word);
          } else {
            // speak clicked text or target
            const selection = window.getSelection().toString();
            if (selection) audioManager.speak(selection);
          }
        }}
      />
    );
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          <span>📖</span> {story.title}
        </h2>
        <p className="section-desc">{story.description}</p>
      </div>

      {/* Story Controls Bar */}
      <div className="story-controls">
        <div className="reading-mode-selector">
          <button 
            className={`mode-btn ${readingMode === 'natural' ? 'active' : ''}`}
            onClick={() => setReadingMode('natural')}
          >
            🎌 Kanji + Furigana
          </button>
          <button 
            className={`mode-btn ${readingMode === 'hiragana' ? 'active' : ''}`}
            onClick={() => setReadingMode('hiragana')}
          >
            あ Solo Hiragana
          </button>
          <button 
            className={`mode-btn ${readingMode === 'kanji_only' ? 'active' : ''}`}
            onClick={() => setReadingMode('kanji_only')}
          >
            漢 Solo Kanji
          </button>
        </div>

        <button className="btn btn-outline btn-sm" onClick={handlePlayChapter}>
          <Volume2 size={16} />
          <span>Escuchar Capítulo Completo</span>
        </button>
      </div>

      {/* Chapter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {story.paragraphs.map(p => (
          <button
            key={p.chapter}
            className={`btn ${p.chapter === currentChapter ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => {
              setCurrentChapter(p.chapter);
              setTypingFeedback(null);
            }}
          >
            Capítulo {p.chapter}: {p.title.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Story Main Reader */}
      <div className={`story-content-box ${readingMode === 'kanji_only' ? 'hide-furigana' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
            Capítulo {chapter.chapter}: {chapter.title}
          </h3>
          <button 
            className="audio-btn" 
            title="Escuchar párrafo" 
            onClick={() => audioManager.speak(chapter.japanese)}
          >
            <Volume2 size={16} />
          </button>
        </div>

        <div className="jp-text" style={{ lineHeight: 2.3, fontSize: '1.35rem' }}>
          {readingMode === 'hiragana' ? (
            <p>{chapter.hiragana}</p>
          ) : (
            renderRubyParagraph(chapter.japanese)
          )}
        </div>

        <details style={{ marginTop: '24px', padding: '14px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <summary style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>
            🇪🇸 Ver traducción en español del Capítulo {chapter.chapter}
          </summary>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            {chapter.translation_es}
          </p>
        </details>
      </div>

      {/* Sentence Breakdown & IME Typing Practice */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔍</span> Desglose Oración por Oración y Práctica de Teclado
          </h3>
        </div>

        {activeSentence && (
          <div className="breakdown-card" style={{ borderLeft: '5px solid var(--primary)' }}>
            <div className="breakdown-header">
              <div className="breakdown-jp jp-text">
                {activeSentence.japanese}
              </div>
              <button 
                className="audio-btn"
                onClick={() => audioManager.speak(activeSentence.japanese)}
                title="Escuchar oración"
              >
                <Volume2 size={16} />
              </button>
            </div>

            <div className="breakdown-translations">
              <div className="trans-item">
                <strong>🇬🇧 Significado:</strong> {activeSentence.english}
              </div>
            </div>

            {activeSentence.grammar_note && (
              <div className="grammar-note-box">
                <strong>💡 Explicación Gramatical:</strong><br />
                {activeSentence.grammar_note}
              </div>
            )}

            {/* IME Typing Exercise */}
            <div className="typing-box">
              <div className="typing-prompt">
                <span>✍️ Práctica de Escritura con Teclado Japonés:</span>
                <span className="ime-badge">🇯🇵 Teclado IME</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Teclea la oración en japonés con tu teclado. Presiona <strong>Enter</strong> para verificar:
              </p>

              <div className="typing-input-row">
                <input
                  type="text"
                  className="japanese-input jp-text"
                  placeholder="Escribe la frase en japonés..."
                  value={typingInput}
                  onChange={(e) => setTypingInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheckTyping();
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <button className="btn btn-primary" onClick={handleCheckTyping}>
                  Verificar
                </button>
                <button className="btn btn-outline" onClick={handleHint}>
                  Pista
                </button>
              </div>

              {typingFeedback && (
                <div className={`typing-feedback ${typingFeedback.type}`}>
                  {typingFeedback.msg}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sentences List for this Chapter */}
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>
            Selecciona una oración para desglosarla ({chapterSentences.length} oraciones):
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chapterSentences.map((s, idx) => {
              const isDone = userState?.completedSentences?.[s.id];
              const isSelected = s.id === selectedSentenceId;

              return (
                <div
                  key={s.id}
                  className="card"
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    background: isSelected ? 'var(--primary-bg)' : 'var(--bg-surface)'
                  }}
                  onClick={() => handleSentenceClick(s)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="jp-text" style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '2px' }}>
                        {idx + 1}. {s.japanese}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {s.english}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isDone && (
                        <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          ✓ Dominada
                        </span>
                      )}
                      <button
                        className="audio-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioManager.speak(s.japanese);
                        }}
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
