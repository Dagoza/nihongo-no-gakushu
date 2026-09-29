/**
 * Utilidades para procesamiento y tokenización del idioma japonés
 */

// Rango Unicode de Hiragana a Katakana: shift de 0x60 (96)
export function hiraganaToKatakana(str = '') {
  if (!str) return '';
  return str.replace(/[\u3041-\u3096]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) + 0x60)
  );
}

export function katakanaToHiragana(str = '') {
  if (!str) return '';
  return str.replace(/[\u30a1-\u30f6]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60)
  );
}

// Verifica si un carácter es Kanji
export function isKanjiChar(char = '') {
  if (!char) return false;
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9faf) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf)    // CJK Extension A
  );
}

// Extrae todos los kanjis únicos de un texto
export function extractKanjis(text = '') {
  if (!text) return [];
  const chars = Array.from(text);
  const kanjis = chars.filter(isKanjiChar);
  return Array.from(new Set(kanjis));
}

// Verifica si una cadena contiene al menos un kanji
export function containsKanji(text = '') {
  return /[\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
}

// Segmentador nativo de japonés usando Intl.Segmenter
export function tokenizeJapanese(text = '') {
  if (!text) return [];

  // Usar Intl.Segmenter si está disponible en el navegador/entorno
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
      const segments = Array.from(segmenter.segment(text));
      return segments.map(s => ({
        text: s.segment,
        isWordLike: s.isWordLike,
        index: s.index
      }));
    } catch (e) {
      console.warn('Intl.Segmenter fallback:', e);
    }
  }

  // Fallback simple por caracteres y partículas si Intl.Segmenter no estuviera soportado
  const tokens = [];
  let current = '';
  for (const char of text) {
    if (/[\s,.!?。、！？]/.test(char)) {
      if (current) {
        tokens.push({ text: current, isWordLike: true });
        current = '';
      }
      tokens.push({ text: char, isWordLike: false });
    } else {
      current += char;
    }
  }
  if (current) tokens.push({ text: current, isWordLike: true });
  return tokens;
}

// Formateador de tiempo mm:ss o hh:mm:ss
export function formatTimestamp(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const pad = (n) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

// Diccionario integrado para autocompletar lecturas y definiciones comunes
export const COMMON_WORD_DICT = {
  '多分': { hiragana: 'たぶん', katakana: 'タブン', meaning_es: 'Quizás / Probablemente / Tal vez', level: 'N5', category: 'Adverbios y Expresiones', notes: 'Indica suposición o probabilidad moderada.' },
  'たぶん': { kanji: '多分', hiragana: 'たぶん', katakana: 'タブン', meaning_es: 'Quizás / Probablemente / Tal vez', level: 'N5', category: 'Adverbios y Expresiones', notes: 'Indica suposición o probabilidad moderada.' },
  '明後日': { hiragana: 'あさって', katakana: 'アサッテ', meaning_es: 'Pasado mañana', level: 'N5', category: 'Tiempo y Fechas', notes: 'Lectura jukujikun: あさって (formal: みょうごにち).' },
  'あさって': { kanji: '明後日', hiragana: 'あさって', katakana: 'アサッテ', meaning_es: 'Pasado mañana', level: 'N5', category: 'Tiempo y Fechas', notes: 'Lectura jukujikun: あさって (formal: みょうごにち).' },
  '明日': { hiragana: 'あした', katakana: 'アシタ', meaning_es: 'Mañana (día siguiente)', level: 'N5', category: 'Tiempo y Fechas' },
  'あした': { kanji: '明日', hiragana: 'あした', katakana: 'アシタ', meaning_es: 'Mañana (día siguiente)', level: 'N5', category: 'Tiempo y Fechas' },
  '私': { hiragana: 'わたし', katakana: 'ワタシ', meaning_es: 'Yo / Mí mismo', level: 'N5', category: 'Pronombres' },
  '先生': { hiragana: 'せんせい', katakana: 'センセイ', meaning_es: 'Profesor / Maestro', level: 'N5', category: 'Personas y Profesiones' },
  '先生方': { hiragana: 'せんせいがた', katakana: 'センセイガタ', meaning_es: 'Profesores (plural formal)', level: 'N5', category: 'Personas y Profesiones' },
  '学生': { hiragana: 'がくせい', katakana: 'ガクセイ', meaning_es: 'Estudiante / Alumno', level: 'N5', category: 'Personas y Profesiones' },
  '学校': { hiragana: 'がっこう', katakana: 'ガッコウ', meaning_es: 'Escuela / Colegio', level: 'N5', category: 'Lugares y Ciudad' },
  '駅': { hiragana: 'えき', katakana: 'エキ', meaning_es: 'Estación de tren', level: 'N5', category: 'Transporte y Viajes' },
  '電車': { hiragana: 'でんしゃ', katakana: 'デンシャ', meaning_es: 'Tren eléctrico', level: 'N5', category: 'Transporte y Viajes' },
  '車': { hiragana: 'くるま', katakana: 'クルマ', meaning_es: 'Coche / Auto', level: 'N5', category: 'Transporte y Viajes' },
  '道': { hiragana: 'みち', katakana: 'ミチ', meaning_es: 'Camino / Calle', level: 'N5', category: 'Lugares y Ciudad' },
  '外国': { hiragana: 'がいこく', katakana: 'ガイコク', meaning_es: 'País extranjero', level: 'N5', category: 'Lugares y Ciudad' },
  '国': { hiragana: 'くに', katakana: 'クニ', meaning_es: 'País / Nación', level: 'N5', category: 'Lugares y Ciudad' },
  '今日': { hiragana: 'きょう', katakana: 'キョウ', meaning_es: 'Hoy', level: 'N5', category: 'Tiempo y Fechas' },
  '今年': { hiragana: 'ことし', katakana: 'コトシ', meaning_es: 'Este año', level: 'N5', category: 'Tiempo y Fechas' },
  '毎日': { hiragana: 'まいにち', katakana: 'マイニチ', meaning_es: 'Todos los días / Diario', level: 'N5', category: 'Tiempo y Fechas' },
  '朝': { hiragana: 'あさ', katakana: 'アサ', meaning_es: 'Mañana (tiempo)', level: 'N5', category: 'Tiempo y Fechas' },
  '朝ごはん': { hiragana: 'あさごはん', katakana: 'アサゴハン', meaning_es: 'Desayuno', level: 'N5', category: 'Comida y Bebida' },
  '水': { hiragana: 'みず', katakana: 'ミズ', meaning_es: 'Agua', level: 'N5', category: 'Comida y Bebida' },
  '魚': { hiragana: 'さかな', katakana: 'サカナ', meaning_es: 'Pescado / Pez', level: 'N5', category: 'Comida y Bebida' },
  'お茶': { hiragana: 'おちゃ', katakana: 'オチャ', meaning_es: 'Té verde / Té', level: 'N5', category: 'Comida y Bebida' },
  '飲み物': { hiragana: 'のみもの', katakana: 'ノミモノ', meaning_es: 'Bebida', level: 'N5', category: 'Comida y Bebida' },
  '本': { hiragana: 'ほん', katakana: 'ホン', meaning_es: 'Libro', level: 'N5', category: 'Objetos y Escuela' },
  '机': { hiragana: 'つくえ', katakana: 'ツクエ', meaning_es: 'Escritorio / Mesa de estudio', level: 'N5', category: 'Objetos y Escuela' },
  '漢字': { hiragana: 'かんじ', katakana: 'カンジ', meaning_es: 'Ideograma Kanji', level: 'N5', category: 'Educación' },
  '日本語': { hiragana: 'にほんご', katakana: 'ニホンゴ', meaning_es: 'Idioma japonés', level: 'N5', category: 'Educación' },
  '勉強': { hiragana: 'べんきょう', katakana: 'ベンキョウ', meaning_es: 'Estudio / Estudiar', level: 'N5', category: 'Educación' },
  '友達': { hiragana: 'ともだち', katakana: 'トモダチ', meaning_es: 'Amigo / Amiga', level: 'N5', category: 'Personas y Profesiones' },
  '父': { hiragana: 'ちち', katakana: 'チチ', meaning_es: 'Padre (mi padre)', level: 'N5', category: 'Familia' },
  '母': { hiragana: 'はは', katakana: 'ハハ', meaning_es: 'Madre (mi madre)', level: 'N5', category: 'Familia' },
  '山': { hiragana: 'やま', katakana: 'ヤマ', meaning_es: 'Montaña', level: 'N5', category: 'Naturaleza y Clima' },
  '川': { hiragana: 'かわ', katakana: 'カワ', meaning_es: 'Río', level: 'N5', category: 'Naturaleza y Clima' },
  '木': { hiragana: 'き', katakana: 'キ', meaning_es: 'Árbol / Madera', level: 'N5', category: 'Naturaleza y Clima' },
  '花': { hiragana: 'はな', katakana: 'ハナ', meaning_es: 'Flor', level: 'N5', category: 'Naturaleza y Clima' },
  '天気': { hiragana: 'てんき', katakana: 'テンキ', meaning_es: 'Clima / Tiempo', level: 'N5', category: 'Naturaleza y Clima' },
  '空': { hiragana: 'そら', katakana: 'ソラ', meaning_es: 'Cielo', level: 'N5', category: 'Naturaleza y Clima' },
  '雲': { hiragana: 'くも', katakana: 'クモ', meaning_es: 'Nube', level: 'N5', category: 'Naturaleza y Clima' },
  '雨': { hiragana: 'あめ', katakana: 'アメ', meaning_es: 'Lluvia', level: 'N5', category: 'Naturaleza y Clima' },
  '時間': { hiragana: 'じかん', katakana: 'ジカン', meaning_es: 'Tiempo / Horas', level: 'N5', category: 'Tiempo y Fechas' },
  '美味しい': { hiragana: 'おいしい', katakana: 'オイシイ', meaning_es: 'Delicioso / Sabroso', level: 'N5', category: 'Adjetivos' },
  '面白い': { hiragana: 'おもしろい', katakana: 'オモシロイ', meaning_es: 'Interesante / Divertido', level: 'N5', category: 'Adjetivos' },
  '難しい': { hiragana: 'むずかしい', katakana: 'ムズカシイ', meaning_es: 'Difícil', level: 'N5', category: 'Adjetivos' },
  '高い': { hiragana: 'たかい', katakana: 'タカイ', meaning_es: 'Alto / Caro', level: 'N5', category: 'Adjetivos' },
  '安い': { hiragana: 'やすい', katakana: 'ヤスイ', meaning_es: 'Barato', level: 'N5', category: 'Adjetivos' },
  '新しい': { hiragana: 'あたらしい', katakana: 'アタラシイ', meaning_es: 'Nuevo', level: 'N5', category: 'Adjetivos' },
  '古い': { hiragana: 'ふるい', katakana: 'フルイ', meaning_es: 'Viejo / Antiguo', level: 'N5', category: 'Adjetivos' },
  '大きい': { hiragana: 'おおきい', katakana: 'オオキイ', meaning_es: 'Grande', level: 'N5', category: 'Adjetivos' },
  '小さい': { hiragana: 'ちいさい', katakana: 'チイサイ', meaning_es: 'Pequeño', level: 'N5', category: 'Adjetivos' },
  '速い': { hiragana: 'はやい', katakana: 'ハヤイ', meaning_es: 'Rápido', level: 'N5', category: 'Adjetivos' },
  '遅い': { hiragana: 'おそい', katakana: 'オソイ', meaning_es: 'Lento / Tarde', level: 'N5', category: 'Adjetivos' },
  '近い': { hiragana: 'ちかい', katakana: 'チカイ', meaning_es: 'Cerca / Cercano', level: 'N5', category: 'Adjetivos' },
  '遠い': { hiragana: 'とおい', katakana: 'トオイ', meaning_es: 'Lejos / Lejano', level: 'N5', category: 'Adjetivos' }
};

/**
 * Busca detalles de una palabra japonesa en el banco de datos o diccionario integrado
 */
export function lookupJapaneseWord(rawText = '', customVocab = [], externalVocab = []) {
  const clean = rawText.trim();
  if (!clean) return null;

  // 1. Buscar en vocabulario personalizado del usuario
  const fromCustom = customVocab.find(
    v => v.kanji === clean || v.kana === clean || v.hiragana === clean || v.katakana === clean
  );
  if (fromCustom) {
    return {
      kanji: fromCustom.kanji || clean,
      hiragana: fromCustom.hiragana || fromCustom.kana || '',
      katakana: fromCustom.katakana || hiraganaToKatakana(fromCustom.hiragana || clean),
      meaning_es: fromCustom.meaning_es || '',
      level: fromCustom.level || 'N5',
      category: fromCustom.category || 'Vocabulario General',
      source: fromCustom.source || 'Usuario'
    };
  }

  // 2. Buscar en catálogo general si se proporciona
  const fromExternal = externalVocab.find(
    v => v.kanji === clean || v.kana === clean || v.hiragana === clean
  );
  if (fromExternal) {
    return {
      kanji: fromExternal.kanji || clean,
      hiragana: fromExternal.hiragana || fromExternal.kana || '',
      katakana: fromExternal.katakana || hiraganaToKatakana(fromExternal.hiragana || fromExternal.kana || clean),
      meaning_es: fromExternal.meaning_es || '',
      level: fromExternal.level || 'N5',
      category: fromExternal.category || 'Vocabulario General',
      source: 'Catálogo Nihongo'
    };
  }

  // 3. Buscar en diccionario integrado
  if (COMMON_WORD_DICT[clean]) {
    const entry = COMMON_WORD_DICT[clean];
    return {
      kanji: clean,
      hiragana: entry.hiragana,
      katakana: entry.katakana,
      meaning_es: entry.meaning_es,
      level: entry.level,
      category: entry.category,
      source: 'Diccionario N5/N4'
    };
  }

  // 4. Inferencia por Kana/Kanji
  const hasKanji = containsKanji(clean);
  const guessedHira = hasKanji ? katakanaToHiragana(clean) : clean;
  const guessedKata = hiraganaToKatakana(clean);

  return {
    kanji: clean,
    hiragana: hasKanji ? '' : guessedHira,
    katakana: hasKanji ? '' : guessedKata,
    meaning_es: '',
    level: 'N5',
    category: 'Vocabulario General',
    source: 'Inferencia'
  };
}

/**
 * Genera un prompt estructurado para IA (ChatGPT / Claude / Gemini) para crear una historia
 */
export function buildStoryPrompt({
  words = [],
  phrases = [],
  level = 'N5',
  theme = 'daily'
}) {
  const themeLabels = {
    daily: 'Vida diaria y rutina en Tokio',
    cafe: 'Una tarde en una cafetería japonesa tradicional y moderna',
    travel: 'Un viaje en tren bala (Shinkansen) hacia Kioto',
    school: 'Un día de clases de japonés con amigos y profesores',
    food: 'Descubriendo comida callejera y un puesto de ramen artesanal',
    fantasy: 'Un misterio tradicional cerca de un templo antiguo en la montaña'
  };

  const themeDesc = themeLabels[theme] || themeLabels.daily;

  let vocabListText = '';
  if (words.length > 0) {
    vocabListText += `\n【Palabras obligatorias a incluir】:\n`;
    words.forEach((w) => {
      const k = w.kanji || w.text;
      const h = w.hiragana ? ` (${w.hiragana})` : '';
      const m = w.meaning_es ? ` - ${w.meaning_es}` : '';
      vocabListText += `- ${k}${h}${m}\n`;
    });
  }

  if (phrases.length > 0) {
    vocabListText += `\n【Frases o expresiones a inspirar / incorporar】:\n`;
    phrases.forEach((p) => {
      const text = p.japanese || p.text;
      const tr = p.translation ? ` ("${p.translation}")` : '';
      vocabListText += `* "${text}"${tr}\n`;
    });
  }

  return `Actúa como un profesor nativo de japonés y autor pedagógico experto en la enseñanza del JLPT.

Por favor, escribe una historia interactiva breve, entretenida y estructurada en japonés para un estudiante de nivel JLPT ${level}.

Temática central: ${themeDesc}.
${vocabListText}

Requisitos obligatorios de la historia:
1. TÍTULO: Atractivo y con sentido (ejemplo: 日本語での一日 - Un día en japonés).
2. CONTENIDO (3 a 5 párrafos):
   - Redacción natural pero accesible al nivel ${level}.
   - Las palabras seleccionadas deben integrarse de forma fluida y destacarse en **negrita** la primera vez que aparecen.
   - Oraciones claras y gramática coherente con el nivel JLPT ${level}.
3. FORMATO DE ENTREGA:
   - Bloque 1: Texto completo en japonés (Kanji estándar + Kana).
   - Bloque 2: Transcripción completa en Hiragana / Furigana de cada párrafo.
   - Bloque 3: Traducción cuidada y natural al español.
   - Bloque 4: Glosario de vocabulario clave usado.
   - Bloque 5: Mini-cuestionario de 3 preguntas de comprensión lectora en japonés simple con opciones múltiple (A, B, C) y solución explicada.

Mantén un tono cálido, inmersivo y motivador para estudiantes de japonés.`;
}

/**
 * Exporta vocabulario en formato estricto JSON según INSTRUCCIONES.md
 */
export function exportVocabularyAsJson(words = []) {
  const formatted = words.map((w, index) => {
    const finalKatakana = w.katakana || hiraganaToKatakana(w.hiragana || w.kana || w.kanji || '');
    return {
      id: w.id || `v_custom_${index + 1}`,
      kanji: (w.kanji || w.text || '').trim(),
      hiragana: (w.hiragana || w.kana || '').trim(),
      katakana: finalKatakana.trim(),
      kana: (w.hiragana || w.kana || '').trim(),
      meaning_es: (w.meaning_es || w.translation || '').trim(),
      meaning_en: (w.meaning_en || '').trim(),
      category: w.category || 'Vocabulario General',
      level: w.level || 'N5'
    };
  });
  return JSON.stringify(formatted, null, 2);
}

/**
 * Exporta palabras y frases a formato CSV compatible con Anki
 */
export function exportAsAnkiCsv(words = [], phrases = []) {
  const lines = ['Kanji / Japonés\tHiragana\tKatakana\tSignificado (Español)\tNivel\tTipo / Origen'];

  words.forEach(w => {
    lines.push(
      `${w.kanji || ''}\t${w.hiragana || ''}\t${w.katakana || ''}\t${w.meaning_es || ''}\t${w.level || 'N5'}\tPalabra`
    );
  });

  phrases.forEach(p => {
    lines.push(
      `${p.japanese || ''}\t\t\t${p.translation || ''}\t${p.level || 'N5'}\tFrase (${p.source || 'Reproductor'})`
    );
  });

  return lines.join('\n');
}

/**
 * Exporta palabras y frases a Markdown para apuntes o Notion
 */
export function exportAsMarkdown(words = [], phrases = []) {
  let md = `# Cuaderno de Vocabulario y Frases — Nihongo Master\n\n`;
  md += `*Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}*\n\n`;

  if (words.length > 0) {
    md += `## 📚 Palabras Guardadas (${words.length})\n\n`;
    md += `| Kanji | Hiragana | Katakana | Significado | Nivel | Categoría |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    words.forEach(w => {
      md += `| **${w.kanji || ''}** | ${w.hiragana || ''} | ${w.katakana || ''} | ${w.meaning_es || ''} | ${w.level || 'N5'} | ${w.category || ''} |\n`;
    });
    md += `\n`;
  }

  if (phrases.length > 0) {
    md += `## 💬 Frases y Expresiones (${phrases.length})\n\n`;
    md += `| Expresión en Japonés | Traducción al Español | Origen |\n`;
    md += `| :--- | :--- | :--- |\n`;
    phrases.forEach(p => {
      md += `| **${p.japanese || ''}** | ${p.translation || ''} | ${p.source || 'Reproductor'} |\n`;
    });
    md += `\n`;
  }

  return md;
}
