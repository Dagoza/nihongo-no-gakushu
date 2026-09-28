/**
 * Nihongo Master - Interactive Story Reader Component
 * Multi-part story with Natural (Furigana), Hiragana-only, and Kanji-only modes.
 * Sentence-by-sentence grammar analysis and Japanese IME typing practice.
 */

class StoryComponent {
  constructor() {
    this.currentChapter = 1;
    this.readingMode = 'natural'; // 'natural', 'hiragana', 'kanji_only'
    this.selectedSentence = null;
    this.data = window.STORY_DATA;
  }

  init() {
    this.render();
  }

  render() {
    const container = document.getElementById('story-panel');
    if (!container || !this.data) return;

    const chapter = this.data.paragraphs.find(p => p.chapter === this.currentChapter) || this.data.paragraphs[0];

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span>📖</span> ${this.data.title}
        </h2>
        <p class="section-desc">${this.data.description}</p>
      </div>

      <!-- Controls Bar -->
      <div class="story-controls">
        <div class="reading-mode-selector">
          <button class="mode-btn ${this.readingMode === 'natural' ? 'active' : ''}" onclick="window.storyComp.setMode('natural')">
            🎌 Kanji + Furigana
          </button>
          <button class="mode-btn ${this.readingMode === 'hiragana' ? 'active' : ''}" onclick="window.storyComp.setMode('hiragana')">
            あ Solo Hiragana
          </button>
          <button class="mode-btn ${this.readingMode === 'kanji_only' ? 'active' : ''}" onclick="window.storyComp.setMode('kanji_only')">
            漢 Solo Kanji
          </button>
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn btn-outline btn-sm" onclick="window.appAudio.speak(window.storyComp.getCurrentChapterText())">
            🔊 Escuchar Capítulo Completo
          </button>
        </div>
      </div>

      <!-- Chapter Tabs -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
        ${this.data.paragraphs.map(p => `
          <button class="btn ${p.chapter === this.currentChapter ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="window.storyComp.setChapter(${p.chapter})">
            Capítulo ${p.chapter}: ${p.title.split(' ')[0]}
          </button>
        `).join('')}
      </div>

      <!-- Main Story Reading Card -->
      <div class="story-content-box ${this.readingMode === 'kanji_only' ? 'hide-furigana' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">
            Capítulo ${chapter.chapter}: ${chapter.title}
          </h3>
          <button class="audio-btn" title="Escuchar este párrafo" onclick="window.appAudio.speak('${this.escapeAudio(this.getChapterRawText(chapter))}')">
            🔊
          </button>
        </div>

        <div class="story-text-container jp-text" style="line-height: 2.3; font-size: 1.3rem;">
          ${this.formatChapterContent(chapter)}
        </div>

        <!-- Spanish Translation Accordion -->
        <details style="margin-top: 24px; padding: 14px; background: var(--bg-main); border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.95rem;">
          <summary style="font-weight: 600; cursor: pointer; color: var(--text-main);">
            🇪🇸 Ver traducción completa al español del Capítulo ${chapter.chapter}
          </summary>
          <p style="margin-top: 10px; color: var(--text-muted); line-height: 1.6;">
            ${chapter.translation_es}
          </p>
        </details>
      </div>

      <!-- Sentence Analysis & Interactive Typing Area -->
      <div class="card" id="sentence-breakdown-card" style="margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span>🔍</span> Análisis y Práctica de Oraciones
          </h3>
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            Toca cualquier oración arriba para analizarla o practica con la lista
          </span>
        </div>

        <div id="active-sentence-detail">
          ${this.renderActiveSentenceDetail()}
        </div>

        <!-- All Sentences for this Chapter -->
        <div style="margin-top: 24px;">
          <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 12px; color: var(--text-muted);">
            Oraciones de este capítulo (${this.getChapterSentences(chapter.chapter).length} oraciones):
          </h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${this.getChapterSentences(chapter.chapter).map((s, idx) => `
              <div class="card" style="padding: 14px 18px; cursor: pointer; border-color: ${this.selectedSentence && this.selectedSentence.id === s.id ? 'var(--primary)' : 'var(--border)'}; background: ${this.selectedSentence && this.selectedSentence.id === s.id ? 'var(--primary-bg)' : 'var(--bg-surface)'};" onclick="window.storyComp.selectSentence('${s.id}')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                  <div style="flex: 1;">
                    <div class="jp-text" style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">
                      ${idx + 1}. ${s.japanese}
                    </div>
                    <div style="font-size: 0.88rem; color: var(--text-muted);">
                      ${s.english}
                    </div>
                  </div>
                  <div style="display: flex; gap: 8px; align-items: center;">
                    ${window.appStorage.isSentenceCompleted(s.id) ? '<span style="color: var(--success); font-weight: bold; font-size: 0.85rem;">✓ Dominada</span>' : ''}
                    <button class="audio-btn" onclick="event.stopPropagation(); window.appAudio.speak('${this.escapeAudio(s.japanese)}')">
                      🔊
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindTypingEvents();
  }

  formatChapterContent(chapter) {
    if (this.readingMode === 'hiragana') {
      return chapter.hiragana || chapter.japanese;
    }

    // Natural Japanese with Furigana (<ruby>)
    // Convert common words to ruby tags
    let formatted = chapter.japanese;
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

    // Sort keys by descending length to match compound kanji before individual characters
    const sortedRubyMap = [...rubyMap].sort((a, b) => b[0].length - a[0].length);
    const rubyDict = Object.fromEntries(rubyMap);
    const escapedKeys = sortedRubyMap.map(([k]) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const reg = new RegExp(escapedKeys.join('|'), 'g');
    formatted = formatted.replace(reg, (kanji) => `<ruby>${kanji}<rt>${rubyDict[kanji]}</rt></ruby>`);

    return formatted;
  }

  getChapterRawText(chapter) {
    return chapter.japanese.replace(/<[^>]+>/g, '');
  }

  getCurrentChapterText() {
    const chapter = this.data.paragraphs.find(p => p.chapter === this.currentChapter) || this.data.paragraphs[0];
    return this.getChapterRawText(chapter);
  }

  escapeAudio(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  setMode(mode) {
    this.readingMode = mode;
    this.render();
  }

  setChapter(num) {
    this.currentChapter = num;
    this.selectedSentence = null;
    this.render();
  }

  getChapterSentences(chapterNum) {
    // Distribute the 58 sentences across chapters approximately:
    // Ch 1: 1-12
    // Ch 2: 13-26
    // Ch 3: 27-40
    // Ch 4: 41-58
    const ranges = {
      1: [0, 12],
      2: [12, 26],
      3: [26, 40],
      4: [40, 58]
    };
    const [start, end] = ranges[chapterNum] || [0, 15];
    return this.data.sentences.slice(start, end);
  }

  selectSentence(id) {
    this.selectedSentence = this.data.sentences.find(s => s.id === id);
    const detailEl = document.getElementById('active-sentence-detail');
    if (detailEl) {
      detailEl.innerHTML = this.renderActiveSentenceDetail();
      this.bindTypingEvents();
      // Scroll to breakdown
      document.getElementById('sentence-breakdown-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  renderActiveSentenceDetail() {
    const s = this.selectedSentence || this.getChapterSentences(this.currentChapter)[0];
    if (!s) return '<p>Selecciona una oración para practicar.</p>';

    const isDone = window.appStorage.isSentenceCompleted(s.id);

    return `
      <div class="breakdown-card" style="border-left: 5px solid var(--primary);">
        <div class="breakdown-header">
          <div class="breakdown-jp jp-text">
            ${s.japanese}
          </div>
          <button class="audio-btn" onclick="window.appAudio.speak('${this.escapeAudio(s.japanese)}')">
            🔊
          </button>
        </div>

        <div class="breakdown-translations">
          <div class="trans-item">
            <strong>🇪🇸 Español:</strong> ${this.translateSentenceEs(s.english)}
          </div>
          <div class="trans-item">
            <strong>🇬🇧 English:</strong> ${s.english}
          </div>
        </div>

        ${s.grammar_note ? `
          <div class="grammar-note-box">
            <strong>💡 Explicación Gramatical & Partículas:</strong><br>
            ${s.grammar_note}
          </div>
        ` : ''}

        <!-- Interactive Typing Exercise (IME Supported) -->
        <div class="typing-box" id="typing-box-container">
          <div class="typing-prompt">
            <span>✍️ Práctica de Escritura con Teclado Japonés:</span>
            <span class="ime-badge">🇯🇵 Teclado Japonés IME</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
            Escribe la oración completa o copia con tu teclado en japonés. Presiona <strong>Enter</strong> para validar:
          </p>

          <div class="typing-input-row">
            <input type="text" id="story-ime-input" class="japanese-input jp-text" placeholder="Escribe aquí en japonés..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
            <button class="btn btn-primary" id="story-check-btn" onclick="window.storyComp.checkTyping('${s.id}')">
              Verificar
            </button>
            <button class="btn btn-outline" onclick="window.storyComp.showHint('${s.id}')">
              Pista
            </button>
          </div>

          <div id="typing-feedback-msg" class="typing-feedback">
            ${isDone ? '<span class="typing-feedback correct">✓ ¡Ya has completado este ejercicio previamente! Puedes volver a practicarlo.</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  translateSentenceEs(en) {
    const dict = {
      "I came from a foreign country this year.": "Llegué del extranjero este año.",
      "My country is far.": "Mi país está lejos.",
      "Today is April 1st, Monday.": "Hoy es lunes 1 de abril.",
      "It is now 6:30 AM.": "Ahora son las 6:30 de la mañana.",
      "I wake up early every day.": "Me levanto temprano todos los días.",
      "The weather is good, and there are only a few white clouds in the sky, but it is mostly blue.": "Hace buen tiempo y casi todo el cielo está azul con pocas nubes blancas.",
      "But, outside is very cold.": "Pero afuera hace mucho frío.",
      "I wash my face with cold water.": "Me lavo la cara con agua fría.",
      "Breakfast always has a good taste and is delicious.": "El desayuno siempre es rico y delicioso.",
      "Of course, I only eat a little.": "Por supuesto, solo como un poco.",
      "Father and mother already went to the company.": "Mi padre y mi madre ya fueron a la empresa.",
      "The children are still at home.": "Los niños todavía están en casa.",
      "I am a student.": "Soy estudiante.",
      "The station is near the school, but it is far from my house, so I take the train.": "La estación está cerca de la escuela, pero como queda lejos de mi casa, tomo el tren.",
      "The road to the station is long.": "El camino a la estación es largo.",
      "There are big trees and beautiful flowers on the road.": "En el camino hay árboles grandes y flores hermosas.",
      "Under the tree, a boy and a girl are standing.": "Debajo del árbol están parados un niño y una niña.",
      "On the right and left, I can see old shops and new small shops.": "A la derecha e izquierda se ven tiendas viejas y tiendas pequeñas nuevas.",
      "In front of the station, there are many people.": "Frente a la estación hay una multitud de gente.",
      "The train is fast, but there are always many people.": "El tren es rápido, pero siempre hay mucha gente.",
      "I leave the station at 8:00 and enter the school.": "Salgo de la estación a las ocho y entro a la escuela.",
      "I met my friend at the south entrance of the school.": "Me encontré con mi amiga en la entrada sur de la escuela.",
      "Her name is \"Mika\".": "Su nombre es Mika.",
      "\"Good morning! How are you?\" I say.": "«¡Buenos días! ¿Cómo estás?» digo yo.",
      "Today we will study Japanese.": "Hoy estudiamos japonés.",
      "The teachers are all good people.": "Los profesores son todos muy buenas personas.",
      "There is a book inside my bag.": "Hay un libro dentro de mi mochila.",
      "I take the book out onto the desk.": "Saco el libro sobre el escritorio.",
      "We listen well to what the teacher says, and read the book.": "Escuchamos bien la explicación del maestro y leemos el libro.",
      "And we write characters.": "Y luego escribimos caracteres.",
      "Today's test is not very easy. It is a little difficult.": "El examen de hoy no es muy fácil. Es un poco difícil.",
      "I ask the teacher, \"What is the reading of this kanji?\"": "Le pregunto al maestro: «¿Cuál es la lectura de este kanji?»",
      "Is the class boring? No, because I study well, it is interesting.": "¿La clase es aburrida? No, como estudio con entusiasmo, es interesante.",
      "During break time, we talk.": "Durante el recreo, conversamos.",
      "It is 12:00 PM. Everyone goes outside, and we eat fish.": "Son las 12:00 PM. Todos salimos y comemos pescado.",
      "We also buy drinks. Tea is about 150 yen.": "También compramos bebidas. El té cuesta unos 150 yenes.",
      "In total, it is 1,298 yen. It is cheap.": "En total son 1.298 yenes. Es barato.",
      "I say to my friend, \"What will you do on Saturday and Sunday of this week?\"": "Le digo a mi amiga: «¿Qué harás el sábado y domingo de esta semana?»",
      "\"I will go to the east mountain. Is the mountain high? No, it is low, but the air is good and it is fun.\"": "«Voy a la montaña del este. ¿Es alta? No, es baja, pero el aire es fresco y es divertido.»",
      "\"That is nice. I will go to the west river. When you put your feet in, it feels good.\"": "«Qué bien. Yo voy al río del oeste. Meter los pies se siente de maravilla.»",
      "\"Tuesday, Wednesday, Thursday, and Friday are busy, but days off are fun. This year is hot, so please drink a lot of water.\"": "«De martes a viernes es muy ocupado, pero el descanso es divertido. Este año hace calor, así que toma mucha agua.»",
      "My friend's father bought an old car for 30,000 yen. So, we might go by car.": "El papá de mi amiga compró un auto viejo por 30.000 yenes. Así que tal vez vayamos en auto.",
      "But cars are slow, so it is better to go by train.": "Pero los autos son lentos, así que es mejor ir en tren.",
      "The north sky is black. It might become bad weather. Rain might come.": "El cielo del norte está negro. Puede que el tiempo empeore. Podría llover.",
      "But, of course, we will go.": "Pero, por supuesto, iremos.",
      "With my own eyes, ears, mouth, and hands, I will enjoy the big mountain.": "Con mis propios ojos, oídos, boca y manos disfrutaré de la gran montaña.",
      "In 5 minutes, the time will come. Two, three, four, five, six, seven, eight, nine, ten. Well then, let's go!": "En 5 minutos llegará la hora. Dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez. ¡Vamos!"
    };
    return dict[en] || en;
  }

  bindTypingEvents() {
    const input = document.getElementById('story-ime-input');
    if (!input) return;

    let isComposing = false;
    input.addEventListener('compositionstart', () => { isComposing = true; });
    input.addEventListener('compositionend', () => { isComposing = false; });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !isComposing) {
        const s = this.selectedSentence || this.getChapterSentences(this.currentChapter)[0];
        if (s) this.checkTyping(s.id);
      }
    });
  }

  cleanJp(str) {
    return str.replace(/[、。！？「」\s]/g, '').trim();
  }

  checkTyping(sentId) {
    const s = this.data.sentences.find(item => item.id === sentId);
    const input = document.getElementById('story-ime-input');
    const msg = document.getElementById('typing-feedback-msg');
    if (!s || !input || !msg) return;

    const userVal = this.cleanJp(input.value);
    const targetVal = this.cleanJp(s.japanese);

    if (!userVal) {
      msg.innerHTML = '<span class="typing-feedback wrong">Por favor escribe tu respuesta en japonés.</span>';
      return;
    }

    if (userVal === targetVal) {
      msg.innerHTML = '<span class="typing-feedback correct">🎉 ¡Excelente! ¡Escritura perfecta en japonés! (+35 XP)</span>';
      window.appStorage.markSentenceCompleted(s.id);
      window.appStorage.recordActivity(true, true);
      // Play audio on success
      window.appAudio.speak(s.japanese);
    } else {
      msg.innerHTML = `<span class="typing-feedback wrong">Casi lo tienes. Revisa caracteres o kanji.<br>Tu entrada: <code>${input.value}</code><br>Objetivo: <code>${s.japanese}</code></span>`;
      window.appStorage.recordActivity(false, true);
    }
  }

  showHint(sentId) {
    const s = this.data.sentences.find(item => item.id === sentId);
    const input = document.getElementById('story-ime-input');
    if (!s || !input) return;
    input.value = s.japanese.slice(0, Math.ceil(s.japanese.length / 2));
    input.focus();
  }
}

window.storyComp = new StoryComponent();
