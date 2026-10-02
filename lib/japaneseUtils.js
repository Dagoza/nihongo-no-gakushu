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

// Cópulas en japonés ordenadas por longitud (para matchear primero las más largas)
export const COPULAS = [
  { form: 'ではありませんでした', base: 'です', formality: 'formal', polarity: 'negative', tense: 'past', meaning_es: 'Cópula negativa formal en pasado (No era / No fue)', role: 'Cópula' },
  { form: 'じゃありませんでした', base: 'です', formality: 'polite', polarity: 'negative', tense: 'past', meaning_es: 'Cópula negativa cortés en pasado (No era / No fue)', role: 'Cópula' },
  { form: 'ではありません', base: 'です', formality: 'formal', polarity: 'negative', tense: 'present', meaning_es: 'Cópula negativa formal (No es / No está)', role: 'Cópula' },
  { form: 'じゃありません', base: 'です', formality: 'polite', polarity: 'negative', tense: 'present', meaning_es: 'Cópula negativa cortés (No es / No está)', role: 'Cópula' },
  { form: 'ではなかった', base: 'だ', formality: 'plain', polarity: 'negative', tense: 'past', meaning_es: 'Cópula negativa informal en pasado (No era / No fue)', role: 'Cópula' },
  { form: 'じゃなかった', base: 'だ', formality: 'plain', polarity: 'negative', tense: 'past', meaning_es: 'Cópula negativa informal en pasado (No era / No fue)', role: 'Cópula' },
  { form: 'ではない', base: 'だ', formality: 'plain', polarity: 'negative', tense: 'present', meaning_es: 'Cópula negativa informal (No es / No está)', role: 'Cópula' },
  { form: 'じゃない', base: 'だ', formality: 'plain', polarity: 'negative', tense: 'present', meaning_es: 'Cópula negativa informal/coloquial (No es / No está)', role: 'Cópula' },
  { form: 'でした', base: 'です', formality: 'polite', polarity: 'affirmative', tense: 'past', meaning_es: 'Cópula afirmativa cortés en pasado (Era / Fue / Estuvo)', role: 'Cópula' },
  { form: 'だった', base: 'だ', formality: 'plain', polarity: 'affirmative', tense: 'past', meaning_es: 'Cópula afirmativa informal en pasado (Era / Fue / Estuvo)', role: 'Cópula' },
  { form: 'でしょう', base: 'です', formality: 'polite', polarity: 'conjectural', tense: 'future/present', meaning_es: 'Cópula conjetural cortés (Probablemente sea / ¿Verdad?)', role: 'Cópula' },
  { form: 'だろう', base: 'だ', formality: 'plain', polarity: 'conjectural', tense: 'future/present', meaning_es: 'Cópula conjetural informal (Probablemente sea / ¿Cierto?)', role: 'Cópula' },
  { form: 'です', base: 'です', formality: 'polite', polarity: 'affirmative', tense: 'present', meaning_es: 'Cópula afirmativa cortés (Es / Son / Está)', role: 'Cópula' },
  { form: 'だ', base: 'だ', formality: 'plain', polarity: 'affirmative', tense: 'present', meaning_es: 'Cópula afirmativa informal (Es / Son / Está)', role: 'Cópula' }
];

// Partículas gramaticales clave del japonés con sus explicaciones
export const PARTICLES = {
  'は': { name: 'Partícula は (wa)', meaning_es: 'Marcador de tema principal ("En cuanto a...")', level: 'N5', role: 'Partícula' },
  'が': { name: 'Partícula が (ga)', meaning_es: 'Marcador de sujeto específico o agente de la acción', level: 'N5', role: 'Partícula' },
  'を': { name: 'Partícula を (wo/o)', meaning_es: 'Marcador de objeto directo ("indica sobre qué recae el verbo")', level: 'N5', role: 'Partícula' },
  'に': { name: 'Partícula に (ni)', meaning_es: 'Destino, punto temporal específico o ubicación estática', level: 'N5', role: 'Partícula' },
  'で': { name: 'Partícula で (de)', meaning_es: 'Lugar donde ocurre una acción, medio o instrumento ("en / con / por medio de")', level: 'N5', role: 'Partícula' },
  'へ': { name: 'Partícula へ (e)', meaning_es: 'Dirección o rumbo de movimiento ("hacia")', level: 'N5', role: 'Partícula' },
  'と': { name: 'Partícula と (to)', meaning_es: 'Conector exhaustivo ("y") o marcador de compañía ("con")', level: 'N5', role: 'Partícula' },
  'も': { name: 'Partícula も (mo)', meaning_es: 'Inclusión ("también / tampoco")', level: 'N5', role: 'Partícula' },
  'から': { name: 'Partícula から (kara)', meaning_es: 'Origen temporal o espacial ("desde"), o causa ("porque")', level: 'N5', role: 'Partícula' },
  'まで': { name: 'Partícula まで (made)', meaning_es: 'Límite temporal o espacial ("hasta")', level: 'N5', role: 'Partícula' },
  'より': { name: 'Partícula より (yori)', meaning_es: 'Comparación ("más que / a partir de")', level: 'N5', role: 'Partícula' },
  'の': { name: 'Partícula の (no)', meaning_es: 'Posesión, pertenencia o modificación ("de")', level: 'N5', role: 'Partícula' },
  'ね': { name: 'Partícula final ね (ne)', meaning_es: 'Partícula de empatía o confirmación ("¿verdad? / ¿no?")', level: 'N5', role: 'Partícula' },
  'よ': { name: 'Partícula final よ (yo)', meaning_es: 'Partícula enfática de información nueva ("¡te aseguro que...!")', level: 'N5', role: 'Partícula' },
  'か': { name: 'Partícula interrogativa か (ka)', meaning_es: 'Signo de interrogación oral ("¿?")', level: 'N5', role: 'Partícula' },
  'や': { name: 'Partícula や (ya)', meaning_es: 'Conector no exhaustivo ("y tal como...")', level: 'N5', role: 'Partícula' }
};

// Desinencias verbales comunes para lematización
export const VERB_INFLECTIONS = [
  { form: 'ませんでした', replacement: 'る', alt: 'う', tense: 'pasado negativo cortés', meaning_es: 'No [hizo]' },
  { form: 'ました', replacement: 'る', alt: 'う', tense: 'pasado afirmativo cortés', meaning_es: '[Hizo / Fue]' },
  { form: 'ません', replacement: 'る', alt: 'う', tense: 'presente negativo cortés', meaning_es: 'No [hace]' },
  { form: 'ます', replacement: 'る', alt: 'う', tense: 'presente afirmativo cortés', meaning_es: '[Hace / Hará]' },
  { form: 'たくないです', replacement: 'る', alt: 'う', tense: 'deseo negativo cortés', meaning_es: 'No querer [hacer]' },
  { form: 'たくない', replacement: 'る', alt: 'う', tense: 'deseo negativo informal', meaning_es: 'No querer [hacer]' },
  { form: 'たいです', replacement: 'る', alt: 'う', tense: 'deseo afirmativo cortés', meaning_es: 'Querer [hacer]' },
  { form: 'たい', replacement: 'る', alt: 'う', tense: 'deseo afirmativo informal', meaning_es: 'Querer [hacer]' },
  { form: 'てください', replacement: 'る', alt: 'う', tense: 'petición cortés', meaning_es: 'Por favor [haz]' },
  { form: 'ています', replacement: 'る', alt: 'う', tense: 'progresivo / estado continuo cortés', meaning_es: 'Está [haciendo]' },
  { form: 'ている', replacement: 'る', alt: 'う', tense: 'progresivo / estado continuo informal', meaning_es: 'Está [haciendo]' },
  { form: 'くないです', replacement: 'い', tense: 'adjetivo negativo cortés', meaning_es: 'No es [adjetivo]' },
  { form: 'くない', replacement: 'い', tense: 'adjetivo negativo informal', meaning_es: 'No es [adjetivo]' },
  { form: 'かったです', replacement: 'い', tense: 'adjetivo pasado cortés', meaning_es: 'Era / Estaba [adjetivo]' },
  { form: 'かった', replacement: 'い', tense: 'adjetivo pasado informal', meaning_es: 'Era / Estaba [adjetivo]' }
];

// Diccionario integrado para autocompletar lecturas y definiciones comunes
export const COMMON_WORD_DICT = {
  '多分': { hiragana: 'たぶん', katakana: 'タブン', meaning_es: 'Quizás / Probablemente / Tal vez', level: 'N5', category: 'Adverbios y Expresiones', notes: 'Indica suposición o probabilidad moderada.' },
  'たぶん': { kanji: '多分', hiragana: 'たぶん', katakana: 'タブン', meaning_es: 'Quizás / Probablemente / Tal vez', level: 'N5', category: 'Adverbios y Expresiones', notes: 'Indica suposición o probabilidad moderada.' },
  '明後日': { hiragana: 'あさって', katakana: 'アサッテ', meaning_es: 'Pasado mañana', level: 'N5', category: 'Tiempo y Fechas', notes: 'Lectura jukujikun: あさって (formal: みょうごにち).' },
  'あさって': { kanji: '明後日', hiragana: 'あさって', katakana: 'アサッテ', meaning_es: 'Pasado mañana', level: 'N5', category: 'Tiempo y Fechas', notes: 'Lectura jukujikun: あさって (formal: みょうごにち).' },
  '明日': { hiragana: 'あした', katakana: 'アシタ', meaning_es: 'Mañana (día siguiente)', level: 'N5', category: 'Tiempo y Fechas' },
  'あした': { kanji: '明日', hiragana: 'あした', katakana: 'アシタ', meaning_es: 'Mañana (día siguiente)', level: 'N5', category: 'Tiempo y Fechas' },
  '私': { hiragana: 'わたし', katakana: 'ワタシ', meaning_es: 'Yo / Mí mismo (primera persona)', level: 'N5', category: 'Pronombres' },
  'わたし': { kanji: '私', hiragana: 'わたし', katakana: 'ワタシ', meaning_es: 'Yo / Mí mismo (primera persona)', level: 'N5', category: 'Pronombres' },
  '僕': { hiragana: 'ぼく', katakana: 'ボク', meaning_es: 'Yo (masculino coloquial/casual)', level: 'N5', category: 'Pronombres' },
  'ぼく': { kanji: '僕', hiragana: 'ぼく', katakana: 'ボク', meaning_es: 'Yo (masculino coloquial/casual)', level: 'N5', category: 'Pronombres' },
  'あなた': { kanji: '貴方', hiragana: 'あなた', katakana: 'アナタ', meaning_es: 'Tú / Usted', level: 'N5', category: 'Pronombres' },
  '先生': { hiragana: 'せんせい', katakana: 'センセイ', meaning_es: 'Profesor / Maestro / Doctor', level: 'N5', category: 'Personas y Profesiones' },
  'せんせい': { kanji: '先生', hiragana: 'せんせい', katakana: 'センセイ', meaning_es: 'Profesor / Maestro / Doctor', level: 'N5', category: 'Personas y Profesiones' },
  '先生方': { hiragana: 'せんせいがた', katakana: 'センセイガタ', meaning_es: 'Profesores (plural formal con sufijo -gata)', level: 'N5', category: 'Personas y Profesiones' },
  '学生': { hiragana: 'がくせい', katakana: 'ガクセイ', meaning_es: 'Estudiante / Alumno', level: 'N5', category: 'Personas y Profesiones' },
  'がくせい': { kanji: '学生', hiragana: 'がくせい', katakana: 'ガクセイ', meaning_es: 'Estudiante / Alumno', level: 'N5', category: 'Personas y Profesiones' },
  '留学生': { hiragana: 'りゅうがくせい', katakana: 'リュウガクセイ', meaning_es: 'Estudiante de intercambio / Extranjero', level: 'N5', category: 'Personas y Profesiones' },
  '学校': { hiragana: 'がっこう', katakana: 'ガッコウ', meaning_es: 'Escuela / Colegio', level: 'N5', category: 'Lugares y Ciudad' },
  'がっこう': { kanji: '学校', hiragana: 'がっこう', katakana: 'ガッコウ', meaning_es: 'Escuela / Colegio', level: 'N5', category: 'Lugares y Ciudad' },
  '大学': { hiragana: 'だいがく', katakana: 'ダイガク', meaning_es: 'Universidad', level: 'N5', category: 'Lugares y Ciudad' },
  '会社': { hiragana: 'かいしゃ', katakana: 'カイシャ', meaning_es: 'Empresa / Compañía', level: 'N5', category: 'Trabajo' },
  '会社員': { hiragana: 'かいしゃいん', katakana: 'カイシャイン', meaning_es: 'Empleado de empresa / Oficinista', level: 'N5', category: 'Personas y Profesiones' },
  '駅': { hiragana: 'えき', katakana: 'エキ', meaning_es: 'Estación de tren', level: 'N5', category: 'Transporte y Viajes' },
  'えき': { kanji: '駅', hiragana: 'えき', katakana: 'エキ', meaning_es: 'Estación de tren', level: 'N5', category: 'Transporte y Viajes' },
  '電車': { hiragana: 'でんしゃ', katakana: 'デンシャ', meaning_es: 'Tren eléctrico', level: 'N5', category: 'Transporte y Viajes' },
  'でんしゃ': { kanji: '電車', hiragana: 'でんしゃ', katakana: 'デンシャ', meaning_es: 'Tren eléctrico', level: 'N5', category: 'Transporte y Viajes' },
  '車': { hiragana: 'くるま', katakana: 'クルマ', meaning_es: 'Coche / Auto', level: 'N5', category: 'Transporte y Viajes' },
  'くるま': { kanji: '車', hiragana: 'くるま', katakana: 'クルマ', meaning_es: 'Coche / Auto', level: 'N5', category: 'Transporte y Viajes' },
  '道': { hiragana: 'みち', katakana: 'ミチ', meaning_es: 'Camino / Calle / Vía', level: 'N5', category: 'Lugares y Ciudad' },
  '外国': { hiragana: 'がいこく', katakana: 'ガイコク', meaning_es: 'País extranjero', level: 'N5', category: 'Lugares y Ciudad' },
  '国': { hiragana: 'くに', katakana: 'クニ', meaning_es: 'País / Nación / Origen', level: 'N5', category: 'Lugares y Ciudad' },
  '日本': { hiragana: 'にほん', katakana: 'ニホン', meaning_es: 'Japón', level: 'N5', category: 'Lugares y Ciudad' },
  '日本人': { hiragana: 'にほんじん', katakana: 'ニホンジン', meaning_es: 'Persona japonesa / Japonés', level: 'N5', category: 'Personas y Profesiones' },
  '今日': { hiragana: 'きょう', katakana: 'キョウ', meaning_es: 'Hoy', level: 'N5', category: 'Tiempo y Fechas' },
  'きょう': { kanji: '今日', hiragana: 'きょう', katakana: 'キョウ', meaning_es: 'Hoy', level: 'N5', category: 'Tiempo y Fechas' },
  '昨日': { hiragana: 'きのう', katakana: 'キノウ', meaning_es: 'Ayer', level: 'N5', category: 'Tiempo y Fechas' },
  'きのう': { kanji: '昨日', hiragana: 'きのう', katakana: 'キノウ', meaning_es: 'Ayer', level: 'N5', category: 'Tiempo y Fechas' },
  '今年': { hiragana: 'ことし', katakana: 'コトシ', meaning_es: 'Este año', level: 'N5', category: 'Tiempo y Fechas' },
  '毎日': { hiragana: 'まいにち', katakana: 'マイニチ', meaning_es: 'Todos los días / A diario', level: 'N5', category: 'Tiempo y Fechas' },
  '朝': { hiragana: 'あさ', katakana: 'アサ', meaning_es: 'Mañana (tiempo matutino)', level: 'N5', category: 'Tiempo y Fechas' },
  '昼': { hiragana: 'ひる', katakana: 'ヒル', meaning_es: 'Mediodía / Tarde', level: 'N5', category: 'Tiempo y Fechas' },
  '夜': { hiragana: 'よる', katakana: 'ヨル', meaning_es: 'Noche', level: 'N5', category: 'Tiempo y Fechas' },
  '朝ごはん': { hiragana: 'あさごはん', katakana: 'アサゴハン', meaning_es: 'Desayuno', level: 'N5', category: 'Comida y Bebida' },
  '昼ごはん': { hiragana: 'ひるごはん', katakana: 'ヒルゴハン', meaning_es: 'Almuerzo / Comida del mediodía', level: 'N5', category: 'Comida y Bebida' },
  '晩ごはん': { hiragana: 'ばんごはん', katakana: 'バンゴハン', meaning_es: 'Cena', level: 'N5', category: 'Comida y Bebida' },
  '水': { hiragana: 'みず', katakana: 'ミズ', meaning_es: 'Agua fría / Agua', level: 'N5', category: 'Comida y Bebida' },
  'お茶': { hiragana: 'おちゃ', katakana: 'オチャ', meaning_es: 'Té verde / Té japonés', level: 'N5', category: 'Comida y Bebida' },
  '魚': { hiragana: 'さかな', katakana: 'サカナ', meaning_es: 'Pescado / Pez', level: 'N5', category: 'Comida y Bebida' },
  '肉': { hiragana: 'にく', katakana: 'ニク', meaning_es: 'Carne', level: 'N5', category: 'Comida y Bebida' },
  '野菜': { hiragana: 'やさい', katakana: 'ヤサイ', meaning_es: 'Verdura / Vegetal', level: 'N5', category: 'Comida y Bebida' },
  'ご飯': { hiragana: 'ごはん', katakana: 'ゴハン', meaning_es: 'Arroz cocido / Comida', level: 'N5', category: 'Comida y Bebida' },
  'パン': { kanji: 'パン', hiragana: 'ぱん', katakana: 'パン', meaning_es: 'Pan', level: 'N5', category: 'Comida y Bebida' },
  '飲み物': { hiragana: 'のみもの', katakana: 'ノミモノ', meaning_es: 'Bebida', level: 'N5', category: 'Comida y Bebida' },
  '食べ物': { hiragana: 'たべもの', katakana: 'タベモノ', meaning_es: 'Comida / Alimento', level: 'N5', category: 'Comida y Bebida' },
  '本': { hiragana: 'ほん', katakana: 'ホン', meaning_es: 'Libro', level: 'N5', category: 'Objetos y Escuela' },
  'ほん': { kanji: '本', hiragana: 'ほん', katakana: 'ホン', meaning_es: 'Libro', level: 'N5', category: 'Objetos y Escuela' },
  '机': { hiragana: 'つくえ', katakana: 'ツクエ', meaning_es: 'Escritorio / Mesa de estudio', level: 'N5', category: 'Objetos y Escuela' },
  '椅子': { hiragana: 'いす', katakana: 'イス', meaning_es: 'Silla', level: 'N5', category: 'Objetos y Hogar' },
  '漢字': { hiragana: 'かんじ', katakana: 'カンジ', meaning_es: 'Ideograma Kanji', level: 'N5', category: 'Educación' },
  '日本語': { hiragana: 'にほんご', katakana: 'ニホンゴ', meaning_es: 'Idioma japonés', level: 'N5', category: 'Educación' },
  '英語': { hiragana: 'えいご', katakana: 'エイゴ', meaning_es: 'Idioma inglés', level: 'N5', category: 'Educación' },
  'スペイン語': { hiragana: 'すぺいんご', katakana: 'スペインゴ', meaning_es: 'Idioma español', level: 'N5', category: 'Educación' },
  '勉強': { hiragana: 'べんきょう', katakana: 'ベンキョウ', meaning_es: 'Estudio / Estudiar', level: 'N5', category: 'Educación' },
  '友達': { hiragana: 'ともだち', katakana: 'トモダチ', meaning_es: 'Amigo / Amiga', level: 'N5', category: 'Personas y Profesiones' },
  'ともだち': { kanji: '友達', hiragana: 'ともだち', katakana: 'トモダチ', meaning_es: 'Amigo / Amiga', level: 'N5', category: 'Personas y Profesiones' },
  '家族': { hiragana: 'かぞく', katakana: 'カゾク', meaning_es: 'Familia', level: 'N5', category: 'Familia' },
  '父': { hiragana: 'ちち', katakana: 'チチ', meaning_es: 'Padre (mi padre)', level: 'N5', category: 'Familia' },
  '母': { hiragana: 'はは', katakana: 'ハハ', meaning_es: 'Madre (mi madre)', level: 'N5', category: 'Familia' },
  'お父さん': { hiragana: 'おとうさん', katakana: 'オトウサン', meaning_es: 'Padre (de otra persona o apelativo)', level: 'N5', category: 'Familia' },
  'お母さん': { hiragana: 'おかあさん', katakana: 'オカアサン', meaning_es: 'Madre (de otra persona o apelativo)', level: 'N5', category: 'Familia' },
  '山': { hiragana: 'やま', katakana: 'ヤマ', meaning_es: 'Montaña', level: 'N5', category: 'Naturaleza y Clima' },
  '川': { hiragana: 'かわ', katakana: 'カワ', meaning_es: 'Río', level: 'N5', category: 'Naturaleza y Clima' },
  '木': { hiragana: 'き', katakana: 'キ', meaning_es: 'Árbol / Madera', level: 'N5', category: 'Naturaleza y Clima' },
  '花': { hiragana: 'はな', katakana: 'ハナ', meaning_es: 'Flor', level: 'N5', category: 'Naturaleza y Clima' },
  '天気': { hiragana: 'てんき', katakana: 'テンキ', meaning_es: 'Clima / Tiempo meteorológico', level: 'N5', category: 'Naturaleza y Clima' },
  '空': { hiragana: 'そら', katakana: 'ソラ', meaning_es: 'Cielo', level: 'N5', category: 'Naturaleza y Clima' },
  '雲': { hiragana: 'くも', katakana: 'クモ', meaning_es: 'Nube', level: 'N5', category: 'Naturaleza y Clima' },
  '雨': { hiragana: 'あめ', katakana: 'アメ', meaning_es: 'Lluvia', level: 'N5', category: 'Naturaleza y Clima' },
  '雪': { hiragana: 'ゆき', katakana: 'ユキ', meaning_es: 'Nieve', level: 'N5', category: 'Naturaleza y Clima' },
  '時間': { hiragana: 'じかん', katakana: 'ジカン', meaning_es: 'Tiempo / Horas transcurridas', level: 'N5', category: 'Tiempo y Fechas' },
  '美味しい': { hiragana: 'おいしい', katakana: 'オイシイ', meaning_es: 'Delicioso / Sabroso', level: 'N5', category: 'Adjetivos' },
  'おいしい': { kanji: '美味しい', hiragana: 'おいしい', katakana: 'オイシイ', meaning_es: 'Delicioso / Sabroso', level: 'N5', category: 'Adjetivos' },
  '面白い': { hiragana: 'おもしろい', katakana: 'オモシロイ', meaning_es: 'Interesante / Divertido', level: 'N5', category: 'Adjetivos' },
  'おもしろい': { kanji: '面白い', hiragana: 'おもしろい', katakana: 'オモシロイ', meaning_es: 'Interesante / Divertido', level: 'N5', category: 'Adjetivos' },
  '難しい': { hiragana: 'むずかしい', katakana: 'ムズカシイ', meaning_es: 'Difícil', level: 'N5', category: 'Adjetivos' },
  'むずかしい': { kanji: '難しい', hiragana: 'むずかしい', katakana: 'ムズカシイ', meaning_es: 'Difícil', level: 'N5', category: 'Adjetivos' },
  '高い': { hiragana: 'たかい', katakana: 'タカイ', meaning_es: 'Alto / Caro (precio o estatura)', level: 'N5', category: 'Adjetivos' },
  'たかい': { kanji: '高い', hiragana: 'たかい', katakana: 'タカイ', meaning_es: 'Alto / Caro', level: 'N5', category: 'Adjetivos' },
  '安い': { hiragana: 'やすい', katakana: 'ヤスイ', meaning_es: 'Barato / Económico', level: 'N5', category: 'Adjetivos' },
  'やすい': { kanji: '安い', hiragana: 'やすい', katakana: 'ヤスイ', meaning_es: 'Barato / Económico', level: 'N5', category: 'Adjetivos' },
  '新しい': { hiragana: 'あたらしい', katakana: 'アタラシイ', meaning_es: 'Nuevo', level: 'N5', category: 'Adjetivos' },
  'あたらしい': { kanji: '新しい', hiragana: 'あたらしい', katakana: 'アタラシイ', meaning_es: 'Nuevo', level: 'N5', category: 'Adjetivos' },
  '古い': { hiragana: 'ふるい', katakana: 'フルイ', meaning_es: 'Viejo / Antiguo', level: 'N5', category: 'Adjetivos' },
  'ふるい': { kanji: '古い', hiragana: 'ふるい', katakana: 'フルイ', meaning_es: 'Viejo / Antiguo', level: 'N5', category: 'Adjetivos' },
  '大きい': { hiragana: 'おおきい', katakana: 'オオキイ', meaning_es: 'Grande', level: 'N5', category: 'Adjetivos' },
  'おおきい': { kanji: '大きい', hiragana: 'おおきい', katakana: 'オオキイ', meaning_es: 'Grande', level: 'N5', category: 'Adjetivos' },
  '小さい': { hiragana: 'ちいさい', katakana: 'チイサイ', meaning_es: 'Pequeño', level: 'N5', category: 'Adjetivos' },
  'ちいさい': { kanji: '小さい', hiragana: 'ちいさい', katakana: 'チイサイ', meaning_es: 'Pequeño', level: 'N5', category: 'Adjetivos' },
  '速い': { hiragana: 'はやい', katakana: 'ハヤイ', meaning_es: 'Rápido (velocidad)', level: 'N5', category: 'Adjetivos' },
  '遅い': { hiragana: 'おそい', katakana: 'オソイ', meaning_es: 'Lento / Tarde', level: 'N5', category: 'Adjetivos' },
  '近い': { hiragana: 'ちかい', katakana: 'チカイ', meaning_es: 'Cerca / Cercano', level: 'N5', category: 'Adjetivos' },
  '遠い': { hiragana: 'とおい', katakana: 'トオイ', meaning_es: 'Lejos / Lejano', level: 'N5', category: 'Adjetivos' },
  '静か': { hiragana: 'しずか', katakana: 'シズカ', meaning_es: 'Silencioso / Tranquilo', level: 'N5', category: 'Adjetivos Na' },
  'しずか': { kanji: '静か', hiragana: 'しずか', katakana: 'シズカ', meaning_es: 'Silencioso / Tranquilo', level: 'N5', category: 'Adjetivos Na' },
  '元気': { hiragana: 'げんき', katakana: 'ゲンキ', meaning_es: 'Enérgico / Sano / Con ánimo', level: 'N5', category: 'Adjetivos Na' },
  'げんき': { kanji: '元気', hiragana: 'げんき', katakana: 'ゲンキ', meaning_es: 'Enérgico / Sano / Con ánimo', level: 'N5', category: 'Adjetivos Na' },
  '綺麗': { hiragana: 'きれい', katakana: 'キレイ', meaning_es: 'Hermoso / Limpio', level: 'N5', category: 'Adjetivos Na' },
  'きれい': { kanji: '綺麗', hiragana: 'きれい', katakana: 'キレイ', meaning_es: 'Hermoso / Limpio', level: 'N5', category: 'Adjetivos Na' },
  '好き': { hiragana: 'すき', katakana: 'スキ', meaning_es: 'Gustar / Preferido', level: 'N5', category: 'Adjetivos Na' },
  'すき': { kanji: '好き', hiragana: 'すき', katakana: 'スキ', meaning_es: 'Gustar / Preferido', level: 'N5', category: 'Adjetivos Na' },
  '嫌い': { hiragana: 'きらい', katakana: 'キライ', meaning_es: 'Desagradar / Odiado', level: 'N5', category: 'Adjetivos Na' },
  '上手': { hiragana: 'じょうず', katakana: 'ジョウズ', meaning_es: 'Habilidoso / Bueno para algo', level: 'N5', category: 'Adjetivos Na' },
  '下手': { hiragana: 'へた', katakana: 'ヘタ', meaning_es: 'Torpe / Malo para algo', level: 'N5', category: 'Adjetivos Na' },
  '食べる': { hiragana: 'たべる', katakana: 'タベル', meaning_es: 'Comer', level: 'N5', category: 'Verbos' },
  'たべる': { kanji: '食べる', hiragana: 'たべる', katakana: 'タベル', meaning_es: 'Comer', level: 'N5', category: 'Verbos' },
  '飲む': { hiragana: 'のむ', katakana: 'ノム', meaning_es: 'Beber / Tomar', level: 'N5', category: 'Verbos' },
  'のむ': { kanji: '飲む', hiragana: 'のむ', katakana: 'ノム', meaning_es: 'Beber / Tomar', level: 'N5', category: 'Verbos' },
  '行く': { hiragana: 'いく', katakana: 'イク', meaning_es: 'Ir', level: 'N5', category: 'Verbos' },
  'いく': { kanji: '行く', hiragana: 'いく', katakana: 'イク', meaning_es: 'Ir', level: 'N5', category: 'Verbos' },
  '来る': { hiragana: 'くる', katakana: 'クル', meaning_es: 'Venir', level: 'N5', category: 'Verbos' },
  'くる': { kanji: '来る', hiragana: 'くる', katakana: 'クル', meaning_es: 'Venir', level: 'N5', category: 'Verbos' },
  '帰る': { hiragana: 'かえる', katakana: 'カエル', meaning_es: 'Regresar / Volver a casa', level: 'N5', category: 'Verbos' },
  '見る': { hiragana: 'みる', katakana: 'ミル', meaning_es: 'Ver / Mirar', level: 'N5', category: 'Verbos' },
  '聞く': { hiragana: 'きく', katakana: 'キク', meaning_es: 'Escuchar / Preguntar', level: 'N5', category: 'Verbos' },
  '話す': { hiragana: 'はなす', katakana: 'ハナス', meaning_es: 'Hablar / Conversar', level: 'N5', category: 'Verbos' },
  '読む': { hiragana: 'よむ', katakana: 'ヨム', meaning_es: 'Leer', level: 'N5', category: 'Verbos' },
  '書く': { hiragana: 'かく', katakana: 'カク', meaning_es: 'Escribir', level: 'N5', category: 'Verbos' },
  '買う': { hiragana: 'かう', katakana: 'カウ', meaning_es: 'Comprar', level: 'N5', category: 'Verbos' },
  '買う': { hiragana: 'かう', katakana: 'カウ', meaning_es: 'Comprar', level: 'N5', category: 'Verbos' },
  'する': { hiragana: 'する', katakana: 'スル', meaning_es: 'Hacer', level: 'N5', category: 'Verbos' },
  'はじめまして': { kanji: '初めまして', hiragana: 'はじめまして', katakana: 'ハジメマシテ', meaning_es: 'Mucho gusto / Encantado de conocerte', level: 'N5', category: 'Saludos' },
  'こんにちは': { kanji: '今日は', hiragana: 'こんにちは', katakana: 'コンニチハ', meaning_es: 'Hola / Buenas tardes', level: 'N5', category: 'Saludos' },
  'おはよう': { kanji: 'お早う', hiragana: 'おはよう', katakana: 'オハヨウ', meaning_es: 'Buenos días (informal)', level: 'N5', category: 'Saludos' },
  'おはようございます': { kanji: 'お早うございます', hiragana: 'おはようございます', katakana: 'オハヨウゴザイマス', meaning_es: 'Buenos días (formal)', level: 'N5', category: 'Saludos' },
  'こんばんは': { kanji: '今晩は', hiragana: 'こんばんは', katakana: 'コンバンハ', meaning_es: 'Buenas noches (al encontrarse/saludar)', level: 'N5', category: 'Saludos' },
  'さようなら': { kanji: '左様なら', hiragana: 'さようなら', katakana: 'サヨウナラ', meaning_es: 'Adiós / Hasta luego', level: 'N5', category: 'Saludos' },
  'ありがとう': { kanji: '有難う', hiragana: 'ありがとう', katakana: 'アリガトウ', meaning_es: 'Gracias (informal)', level: 'N5', category: 'Expresiones' },
  'ありがとうございます': { kanji: '有難うございます', hiragana: 'ありがとうございます', katakana: 'アリガトウゴザイマス', meaning_es: 'Muchas gracias (formal)', level: 'N5', category: 'Expresiones' },
  'すみません': { kanji: '済みません', hiragana: 'すみません', katakana: 'スミマセン', meaning_es: 'Disculpe / Perdón / Gracias por la molestia', level: 'N5', category: 'Expresiones' },
  'ごめんなさい': { kanji: '御免なさい', hiragana: 'ごめんなさい', katakana: 'ゴメンナサイ', meaning_es: 'Lo siento / Perdón', level: 'N5', category: 'Expresiones' },
  'はい': { kanji: 'はい', hiragana: 'はい', katakana: 'ハイ', meaning_es: 'Sí / De acuerdo', level: 'N5', category: 'Expresiones' },
  'いいえ': { kanji: 'いいえ', hiragana: 'いいえ', katakana: 'イイエ', meaning_es: 'No / De nada', level: 'N5', category: 'Expresiones' },
  'これ': { kanji: '此れ', hiragana: 'これ', katakana: 'コレ', meaning_es: 'Esto (cerca de quien habla)', level: 'N5', category: 'Pronombres' },
  'それ': { kanji: '其れ', hiragana: 'それ', katakana: 'ソレ', meaning_es: 'Eso (cerca del oyente)', level: 'N5', category: 'Pronombres' },
  'あれ': { kanji: 'あれ', hiragana: 'あれ', katakana: 'アレ', meaning_es: 'Aquello (lejos de ambos)', level: 'N5', category: 'Pronombres' },
  'どれ': { kanji: '何れ', hiragana: 'どれ', katakana: 'ドレ', meaning_es: '¿Cuál? (entre tres o más)', level: 'N5', category: 'Pronombres' },
  'ここ': { kanji: '此処', hiragana: 'ここ', katakana: 'ココ', meaning_es: 'Aquí (este lugar)', level: 'N5', category: 'Lugares' },
  'そこ': { kanji: '其処', hiragana: 'そこ', katakana: 'ソコ', meaning_es: 'Ahí (ese lugar)', level: 'N5', category: 'Lugares' },
  'あそこ': { kanji: '彼処', hiragana: 'あそこ', katakana: 'アソコ', meaning_es: 'Allá / Aquel lugar lejano', level: 'N5', category: 'Lugares' },
  'どこ': { kanji: '何処', hiragana: 'どこ', katakana: 'ドコ', meaning_es: '¿Dónde? / ¿Qué lugar?', level: 'N5', category: 'Lugares' },
  'だれ': { kanji: '誰', hiragana: 'だれ', katakana: 'ダレ', meaning_es: '¿Quién?', level: 'N5', category: 'Pronombres' },
  '誰': { hiragana: 'だれ', katakana: 'ダレ', meaning_es: '¿Quién?', level: 'N5', category: 'Pronombres' },
  'なに': { kanji: '何', hiragana: 'なに', katakana: 'ナニ', meaning_es: '¿Qué?', level: 'N5', category: 'Pronombres' },
  'なん': { kanji: '何', hiragana: 'なん', katakana: 'ナン', meaning_es: '¿Qué?', level: 'N5', category: 'Pronombres' },
  '何': { hiragana: 'なに', katakana: 'ナニ', meaning_es: '¿Qué? (nan / nani)', level: 'N5', category: 'Pronombres' },
  'どう': { kanji: '如何', hiragana: 'どう', katakana: 'ドウ', meaning_es: '¿Cómo? / ¿De qué manera?', level: 'N5', category: 'Adverbios' },
  'いくら': { kanji: '幾ら', hiragana: 'いくら', katakana: 'イクラ', meaning_es: '¿Cuánto cuesta? / ¿Cuánto?', level: 'N5', category: 'Preguntas' },
  'ペン': { kanji: 'ペン', hiragana: 'ぺん', katakana: 'ペン', meaning_es: 'Bolígrafo / Lapicero (pen)', level: 'N5', category: 'Objetos y Escuela' },
  'ノート': { kanji: 'ノート', hiragana: 'のーと', katakana: 'ノート', meaning_es: 'Cuaderno / Libreta de notas (notebook)', level: 'N5', category: 'Objetos y Escuela' },
  '鉛筆': { hiragana: 'えんぴつ', katakana: 'エンピツ', meaning_es: 'Lápiz', level: 'N5', category: 'Objetos y Escuela' },
  'えんぴつ': { kanji: '鉛筆', hiragana: 'えんぴつ', katakana: 'エンピツ', meaning_es: 'Lápiz', level: 'N5', category: 'Objetos y Escuela' }
};

/**
 * Detecta y separa cópula o flexión morfológica del final de una palabra
 */
export function splitCopulaAndInflection(text = '') {
  const clean = text.trim();
  if (!clean) return null;

  // 1. Verificar si termina en alguna de las cópulas estándar (ordenadas de mayor a menor longitud)
  for (const c of COPULAS) {
    if (clean.endsWith(c.form) && clean.length > c.form.length) {
      const stem = clean.slice(0, -c.form.length).trim();
      return {
        stem,
        type: 'copula',
        item: c,
        form: c.form,
        base: c.base,
        meaning_es: c.meaning_es,
        role: c.role
      };
    }
  }

  // 2. Verificar desinencias verbales y de adjetivos
  for (const inf of VERB_INFLECTIONS) {
    if (clean.endsWith(inf.form) && clean.length > inf.form.length) {
      const stem = clean.slice(0, -inf.form.length).trim();
      return {
        stem,
        type: 'inflection',
        item: inf,
        form: inf.form,
        tense: inf.tense,
        meaning_es: inf.meaning_es,
        replacement: inf.replacement,
        alt: inf.alt
      };
    }
  }

  return null;
}

/**
 * Busca detalles de una palabra japonesa en el banco de datos o diccionario integrado,
 * desarticulando cópulas y desinencias si la palabra compuesta no se encuentra textualmente.
 */
export function lookupJapaneseWord(rawText = '', customVocab = [], externalVocab = []) {
  const clean = (rawText || '').trim();
  if (!clean) return null;

  // Helper interno de búsqueda directa
  const findDirect = (word) => {
    if (!word) return null;
    const w = word.trim();

    // A. Vocabulario personalizado del usuario
    const fromCustom = customVocab.find(
      v => v.kanji === w || v.kana === w || v.hiragana === w || v.katakana === w
    );
    if (fromCustom) {
      return {
        kanji: fromCustom.kanji || w,
        hiragana: fromCustom.hiragana || fromCustom.kana || '',
        katakana: fromCustom.katakana || hiraganaToKatakana(fromCustom.hiragana || w),
        meaning_es: fromCustom.meaning_es || '',
        level: fromCustom.level || 'N5',
        category: fromCustom.category || 'Vocabulario General',
        source: fromCustom.source || 'Usuario'
      };
    }

    // B. Catálogo general si se proporciona
    const fromExternal = externalVocab.find(
      v => v.kanji === w || v.kana === w || v.hiragana === w
    );
    if (fromExternal) {
      return {
        kanji: fromExternal.kanji || w,
        hiragana: fromExternal.hiragana || fromExternal.kana || '',
        katakana: fromExternal.katakana || hiraganaToKatakana(fromExternal.hiragana || fromExternal.kana || w),
        meaning_es: fromExternal.meaning_es || '',
        level: fromExternal.level || 'N5',
        category: fromExternal.category || 'Vocabulario General',
        source: 'Catálogo Nihongo'
      };
    }

    // C. Diccionario integrado
    if (COMMON_WORD_DICT[w]) {
      const entry = COMMON_WORD_DICT[w];
      return {
        kanji: entry.kanji || w,
        hiragana: entry.hiragana || (containsKanji(w) ? '' : katakanaToHiragana(w)),
        katakana: entry.katakana || hiraganaToKatakana(entry.hiragana || w),
        meaning_es: entry.meaning_es,
        level: entry.level || 'N5',
        category: entry.category || 'Vocabulario General',
        notes: entry.notes || '',
        source: 'Diccionario N5/N4'
      };
    }

    // D. Verificar si es una partícula sola
    if (PARTICLES[w]) {
      const p = PARTICLES[w];
      return {
        kanji: w,
        hiragana: w,
        katakana: hiraganaToKatakana(w),
        meaning_es: p.meaning_es,
        level: p.level,
        category: p.role,
        source: 'Gramática de Partículas'
      };
    }

    // E. Verificar si es una cópula sola
    const copulaAlone = COPULAS.find(c => c.form === w);
    if (copulaAlone) {
      return {
        kanji: copulaAlone.form,
        hiragana: copulaAlone.form,
        katakana: hiraganaToKatakana(copulaAlone.form),
        meaning_es: copulaAlone.meaning_es,
        level: 'N5',
        category: copulaAlone.role,
        source: 'Gramática de Cópulas'
      };
    }

    return null;
  };

  // 1. Búsqueda exacta directa
  const directMatch = findDirect(clean);
  if (directMatch) {
    return directMatch;
  }

  // 2. Si no coincide directamente, desarticular cópula o flexión morfológica
  const splitRes = splitCopulaAndInflection(clean);
  if (splitRes) {
    const stemMatch = findDirect(splitRes.stem);
    if (stemMatch) {
      // Retornar la definición del tallo enriquecida con la cópula/flexión separada
      return {
        ...stemMatch,
        originalText: clean,
        compoundStem: splitRes.stem,
        compoundEnding: splitRes.form,
        endingRole: splitRes.meaning_es || splitRes.role,
        endingType: splitRes.type,
        hasSeparatedEnding: true,
        combinedExplanation: `${stemMatch.meaning_es} + [${splitRes.form}]: ${splitRes.meaning_es}`
      };
    }

    // Si el tallo era un verbo flexionado (ej. 行き de 行きます -> 行く)
    if (splitRes.type === 'inflection') {
      const candidates = [];
      if (splitRes.replacement) candidates.push(splitRes.stem + splitRes.replacement); // Ichidan: 食べる
      const lastChar = splitRes.stem.slice(-1);
      const prefix = splitRes.stem.slice(0, -1);
      const godanMap = {
        'い': 'う', 'き': 'く', 'ぎ': 'ぐ', 'し': 'す',
        'ち': 'つ', 'に': 'ぬ', 'び': 'ぶ', 'み': 'む', 'り': 'る'
      };
      if (godanMap[lastChar]) {
        candidates.push(prefix + godanMap[lastChar]); // Godan: 買う, 飲む, 行く, 話す
      }
      for (const candidate of candidates) {
        const match = findDirect(candidate);
        if (match) {
          return {
            ...match,
            originalText: clean,
            baseForm: candidate,
            compoundEnding: splitRes.form,
            endingRole: splitRes.meaning_es,
            hasSeparatedEnding: true,
            combinedExplanation: `${match.meaning_es} (${splitRes.tense}: ${splitRes.meaning_es})`
          };
        }
      }
    }
  }

  // 3. Inferencia por Kana/Kanji si no hay coincidencia
  const hasKanji = containsKanji(clean);
  const guessedHira = hasKanji ? '' : katakanaToHiragana(clean);
  const guessedKata = hasKanji ? '' : hiraganaToKatakana(clean);

  return {
    kanji: clean,
    hiragana: guessedHira,
    katakana: guessedKata,
    meaning_es: '',
    level: 'N5',
    category: 'Vocabulario General',
    source: 'Inferencia'
  };
}

/**
 * Analiza una oración o frase completa en japonés, separando palabras,
 * partículas, cópulas y desinencias, y buscando el significado de cada una individualmente.
 */
export function analyzeJapaneseSentence(rawText = '', customVocab = [], externalVocab = []) {
  if (!rawText || typeof rawText !== 'string') return [];

  // Limpiar marcas HTML, furigana y caracteres de formato
  const cleaned = rawText
    .replace(/<rt>.*?<\/rt>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[「」『』]/g, '')
    .trim();

  if (!cleaned) return [];

  // Segmentar oraciones usando Intl.Segmenter
  let rawSegments = [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
      rawSegments = Array.from(segmenter.segment(cleaned)).map(s => s.segment);
    } catch (_) {
      rawSegments = [cleaned];
    }
  } else {
    rawSegments = [cleaned];
  }

  // Fusionar fragmentos verbales o cópulas que Intl.Segmenter separa por error
  const VERB_ENDINGS_LIST = [
    'ませんでした', 'じゃありませんでした', 'ではありませんでした',
    'じゃありません', 'ではありません', 'たくないです', 'たくない',
    'たいです', 'たい', 'ました', 'ません', 'ます', 'ている', 'ています',
    'てください', 'くないです', 'くない', 'かったです', 'かった',
    'でした', 'だった', 'でしょう', 'だろう', 'です', 'だ'
  ];

  const mergedSegments = [];
  let i = 0;
  while (i < rawSegments.length) {
    const currentToken = rawSegments[i].trim();
    // Si el token actual es una partícula o puntuación aislada, mantenerla separada
    if (PARTICLES[currentToken] || /^[\s,.!?。、！？\n]+$/.test(currentToken)) {
      mergedSegments.push(currentToken);
      i++;
      continue;
    }

    let bestMatch = null;
    let bestLen = 1;
    for (let j = 1; j <= 4 && (i + j) <= rawSegments.length; j++) {
      // Si alguno de los siguientes tokens a fusionar es una partícula clara, detener la fusión
      if (j > 1 && PARTICLES[rawSegments[i + j - 1].trim()]) {
        break;
      }
      const candidate = rawSegments.slice(i, i + j).join('');
      for (const ending of VERB_ENDINGS_LIST) {
        if (candidate.endsWith(ending) && candidate.length > ending.length) {
          bestMatch = candidate;
          bestLen = j;
          break;
        }
      }
    }
    if (bestMatch && bestLen > 1) {
      mergedSegments.push(bestMatch);
      i += bestLen;
    } else {
      mergedSegments.push(rawSegments[i]);
      i++;
    }
  }

  const results = [];

  for (const s of mergedSegments) {
    const trimmed = (s || '').trim();
    if (!trimmed || /^[\s,.!?。、！？\n]+$/.test(trimmed)) continue;

    // Verificar si el segmento tiene una cópula o desinencia pegada que deba separarse
    const split = splitCopulaAndInflection(trimmed);
    if (split && split.stem) {
      const stemLookup = lookupJapaneseWord(split.stem, customVocab, externalVocab);
      const isKataName = /^[\u30A0-\u30FFー]+$/.test(split.stem);

      // Si es una cópula (ej. アンナです, 学生でした) o una inflexión con tallo reconocido
      if (split.type === 'copula' || (stemLookup && stemLookup.meaning_es)) {
        // 1. Añadir el sustantivo / tallo
        results.push({
          text: stemLookup?.baseForm || split.stem,
          display: split.stem,
          meaning_es: stemLookup?.meaning_es || (isKataName ? 'Nombre propio o término en Katakana' : ''),
          hiragana: stemLookup?.hiragana || (containsKanji(split.stem) ? '' : katakanaToHiragana(split.stem)),
          katakana: stemLookup?.katakana || hiraganaToKatakana(stemLookup?.hiragana || split.stem),
          level: stemLookup?.level || 'N5',
          category: isKataName ? 'Nombre / Préstamo' : (stemLookup?.category || 'Sustantivo'),
          notes: stemLookup?.combinedExplanation || '',
          isKnown: Boolean(stemLookup && stemLookup.meaning_es)
        });

        // 2. Añadir la cópula o flexión como token gramatical independiente
        results.push({
          text: split.form,
          meaning_es: split.meaning_es,
          hiragana: split.form,
          katakana: hiraganaToKatakana(split.form),
          level: 'N5',
          category: split.type === 'copula' ? 'Cópula Gramatical' : 'Flexión Verbal',
          isGrammar: true,
          isKnown: true
        });
        continue;
      }
    }

    // Segmento individual directo
    const lookup = lookupJapaneseWord(trimmed, customVocab, externalVocab);
    const isPart = Boolean(PARTICLES[trimmed]);
    const isCop = COPULAS.some(c => c.form === trimmed);

    results.push({
      text: trimmed,
      meaning_es: lookup?.meaning_es || '',
      hiragana: lookup?.hiragana || (containsKanji(trimmed) ? '' : katakanaToHiragana(trimmed)),
      katakana: lookup?.katakana || hiraganaToKatakana(lookup?.hiragana || trimmed),
      level: lookup?.level || 'N5',
      category: isPart ? 'Partícula' : (isCop ? 'Cópula' : (lookup?.category || 'Palabra')),
      isGrammar: isPart || isCop,
      isKnown: Boolean(lookup && lookup.meaning_es)
    });
  }

  return results;
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
