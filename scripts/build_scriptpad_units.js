const fs = require('fs');
const path = require('path');
const wanakana = require('wanakana');

// Cargar bases de datos maestras
const vocabPath = path.join(__dirname, '../data/vocabulary.json');
const dictPath = path.join(__dirname, '../data/dictionary.json');
const kanjiPath = path.join(__dirname, '../data/kanji.json');
const outputPath = path.join(__dirname, '../data/scriptpad_units.json');

const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
const dictData = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
const kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

// Mapa de palabras existentes para aprovechar audios o traducciones ya registradas
const existingLookup = new Map();
[...vocabData, ...dictData].forEach(item => {
  const k = (item.kanji || item.word || item.hiragana || item.kana || '').trim();
  if (k && !existingLookup.has(k)) {
    existingLookup.set(k, item);
  }
});

// Helper de limpieza y normalización completa de palabra (Regla 1 y 6)
function formatWord(w, defaultCategory = 'Vocabulario General') {
  const kanji = (w.kanji || w.word || '').trim();
  let hiragana = (w.hiragana || w.reading || w.kana || '').trim();
  
  if (!hiragana && kanji) {
    if (wanakana.isKana(kanji)) {
      hiragana = wanakana.toHiragana(kanji);
    }
  }

  let katakana = (w.katakana || '').trim();
  if (!katakana && hiragana) {
    katakana = wanakana.toKatakana(hiragana);
  } else if (!katakana && kanji && wanakana.isKatakana(kanji)) {
    katakana = kanji;
  }

  let romaji = (w.romaji || '').trim();
  if (!romaji && hiragana) {
    romaji = wanakana.toRomaji(hiragana);
  }

  // Nivel estrictamente JLPT N5 a N1
  let level = (w.level || 'N5').toUpperCase().trim();
  if (!['N5', 'N4', 'N3', 'N2', 'N1'].includes(level)) {
    level = 'N5';
  }

  const existing = existingLookup.get(kanji || hiragana);
  const audio_url = w.audio_url || (existing && existing.audio_url) || '';

  return {
    id: w.id || `sp_${kanji || hiragana}`,
    kanji: kanji || hiragana,
    hiragana: hiragana || kanji,
    katakana: katakana,
    romaji: romaji,
    meaning_es: w.meaning_es || w.translation || (existing && (existing.meaning_es || existing.translation)) || '',
    level: level,
    category: w.category || defaultCategory,
    audio_url: audio_url
  };
}

// =========================================================================
// DEFINICIÓN DE UNIDADES Y LECCIONES EN ESPAÑOL CON TÍTULOS DE CONTEXTO PURO
// =========================================================================

const unitsDefinition = [
  // -------------------------------------------------------------
  // UNIDAD 1: Fundamentos, Números y Tiempo
  // -------------------------------------------------------------
  {
    id: 'unit-1-fundamentos',
    title: 'Unidad 1: Fundamentos, Números y Tiempo',
    japanese_title: '日本語の基礎・数字と時間',
    subtitle: 'Números, fechas, tiempo, saludos y pronombres esenciales',
    kanji_icon: '基',
    color: '#8b5cf6',
    bg_gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u1-l1-numeros-0-10',
        number: 1,
        title: 'Números del 0 al 10',
        japanese_title: '数字 0〜10',
        description: 'Conteo y kanjis numéricos iniciales del cero al diez',
        words: [
          { kanji: '零', hiragana: 'ぜろ', meaning_es: 'Cero (0)', level: 'N5' },
          { kanji: '一', hiragana: 'いち', meaning_es: 'Uno (1)', level: 'N5' },
          { kanji: '二', hiragana: 'に', meaning_es: 'Dos (2)', level: 'N5' },
          { kanji: '三', hiragana: 'さん', meaning_es: 'Tres (3)', level: 'N5' },
          { kanji: '四', hiragana: 'よん', meaning_es: 'Cuatro (4)', level: 'N5' },
          { kanji: '五', hiragana: 'ご', meaning_es: 'Cinco (5)', level: 'N5' },
          { kanji: '六', hiragana: 'ろく', meaning_es: 'Seis (6)', level: 'N5' },
          { kanji: '七', hiragana: 'なな', meaning_es: 'Siete (7)', level: 'N5' },
          { kanji: '八', hiragana: 'はち', meaning_es: 'Ocho (8)', level: 'N5' },
          { kanji: '九', hiragana: 'きゅう', meaning_es: 'Nueve (9)', level: 'N5' },
          { kanji: '十', hiragana: 'じゅう', meaning_es: 'Diez (10)', level: 'N5' }
        ]
      },
      {
        id: 'u1-l2-numeros-11-20',
        number: 2,
        title: 'Números del 11 al 20',
        japanese_title: '数字 11〜20',
        description: 'Composición decimal del once al veinte',
        words: [
          { kanji: '十一', hiragana: 'じゅういち', meaning_es: 'Once (11)', level: 'N5' },
          { kanji: '十二', hiragana: 'じゅうに', meaning_es: 'Doce (12)', level: 'N5' },
          { kanji: '十三', hiragana: 'じゅうさん', meaning_es: 'Trece (13)', level: 'N5' },
          { kanji: '十四', hiragana: 'じゅうよん', meaning_es: 'Catorce (14)', level: 'N5' },
          { kanji: '十五', hiragana: 'じゅうご', meaning_es: 'Quince (15)', level: 'N5' },
          { kanji: '十六', hiragana: 'じゅうろく', meaning_es: 'Dieciséis (16)', level: 'N5' },
          { kanji: '十七', hiragana: 'じゅうなな', meaning_es: 'Diecisiete (17)', level: 'N5' },
          { kanji: '十八', hiragana: 'じゅうはち', meaning_es: 'Dieciocho (18)', level: 'N5' },
          { kanji: '十九', hiragana: 'じゅうきゅう', meaning_es: 'Diecinueve (19)', level: 'N5' },
          { kanji: '二十', hiragana: 'にじゅう', meaning_es: 'Veinte (20)', level: 'N5' }
        ]
      },
      {
        id: 'u1-l3-grandes-numeros',
        number: 3,
        title: 'Grandes números y moneda',
        japanese_title: '位・百・千・万・円',
        description: 'Decenas, centenas, millares, decenas de mil y yenes',
        words: [
          { kanji: '三十', hiragana: 'さんじゅう', meaning_es: 'Treinta (30)', level: 'N5' },
          { kanji: '四十', hiragana: 'よんじゅう', meaning_es: 'Cuarenta (40)', level: 'N5' },
          { kanji: '五十', hiragana: 'ごじゅう', meaning_es: 'Cincuenta (50)', level: 'N5' },
          { kanji: '百', hiragana: 'ひゃく', meaning_es: 'Cien (100)', level: 'N5' },
          { kanji: '三百', hiragana: 'さんびゃく', meaning_es: 'Trescientos (300)', level: 'N5' },
          { kanji: '六百', hiragana: 'ろっぴゃく', meaning_es: 'Seiscientos (600)', level: 'N5' },
          { kanji: '八百', hiragana: 'はっぴゃく', meaning_es: 'Ochocientos (800)', level: 'N5' },
          { kanji: '千', hiragana: 'せん', meaning_es: 'Mil (1,000)', level: 'N5' },
          { kanji: '三千', hiragana: 'さんぜん', meaning_es: 'Tres mil (3,000)', level: 'N5' },
          { kanji: '万', hiragana: 'まん', meaning_es: 'Diez mil (10,000)', level: 'N5' },
          { kanji: '億', hiragana: 'おく', meaning_es: 'Cien millones (100,000,000)', level: 'N4' },
          { kanji: '円', hiragana: 'えん', meaning_es: 'Yen (moneda)', level: 'N5' }
        ]
      },
      {
        id: 'u1-l4-ordinales-fracciones',
        number: 4,
        title: 'Números ordinales y fracciones',
        japanese_title: '順序・割合・分数',
        description: 'Orden sucesivo, partes divididas y porcentajes',
        words: [
          { kanji: '第一', hiragana: 'だいいち', meaning_es: 'Primero / Número uno', level: 'N4' },
          { kanji: '一番', hiragana: 'いちばん', meaning_es: 'El más / El primero / Número 1', level: 'N5' },
          { kanji: '二番目', hiragana: 'にばんめ', meaning_es: 'Segundo en turno', level: 'N5' },
          { kanji: '半分', hiragana: 'はんぶん', meaning_es: 'La mitad (1/2)', level: 'N5' },
          { kanji: '三分の一', hiragana: 'さんぶんのいち', meaning_es: 'Un tercio (1/3)', level: 'N4' },
          { kanji: '四分の一', hiragana: 'よんぶんのいち', meaning_es: 'Un cuarto (1/4)', level: 'N4' },
          { kanji: '全部', hiragana: 'ぜんぶ', meaning_es: 'Todo / Totalidad', level: 'N5' },
          { kanji: '幾つ', hiragana: 'いくつ', meaning_es: '¿Cuántos? / ¿Qué edad?', level: 'N5' },
          { kanji: '初めて', hiragana: 'はじめて', meaning_es: 'Por primera vez', level: 'N5' },
          { kanji: '最後', hiragana: 'さいご', meaning_es: 'Último / Al final', level: 'N4' }
        ]
      },
      {
        id: 'u1-l5-matematicas-cantidades',
        number: 5,
        title: 'Matemáticas y cantidades',
        japanese_title: '数量・計算・合計',
        description: 'Términos de cálculo, operaciones y mediciones cuantitativas',
        words: [
          { kanji: '数', hiragana: 'かず', meaning_es: 'Número / Cantidad', level: 'N4' },
          { kanji: '計算', hiragana: 'けいさん', meaning_es: 'Cálculo / Cuenta', level: 'N4' },
          { kanji: '足す', hiragana: 'たす', meaning_es: 'Sumar / Añadir', level: 'N4' },
          { kanji: '引く', hiragana: 'ひく', meaning_es: 'Restar / Tirar de', level: 'N5' },
          { kanji: '掛ける', hiragana: 'かける', meaning_es: 'Multiplicar', level: 'N4' },
          { kanji: '割る', hiragana: 'わる', meaning_es: 'Dividir / Partir', level: 'N4' },
          { kanji: '合計', hiragana: 'ごうけい', meaning_es: 'Total / Suma acumulada', level: 'N4' },
          { kanji: '半額', hiragana: 'はんがく', meaning_es: 'Mitad de precio', level: 'N4' },
          { kanji: '倍', hiragana: 'ばい', meaning_es: 'Doble / Veces más', level: 'N4' },
          { kanji: '零', hiragana: 'れい', meaning_es: 'Cero / Nulo', level: 'N5' }
        ]
      },
      {
        id: 'u1-l6-dias-semana',
        number: 6,
        title: 'Días de la semana',
        japanese_title: '曜日 (ようび)',
        description: 'Los 7 días de la semana y sus elementos naturales',
        words: [
          { kanji: '月曜日', hiragana: 'げつようび', meaning_es: 'Lunes (Día de la luna)', level: 'N5' },
          { kanji: '火曜日', hiragana: 'かようび', meaning_es: 'Martes (Día del fuego)', level: 'N5' },
          { kanji: '水曜日', hiragana: 'すいようび', meaning_es: 'Miércoles (Día del agua)', level: 'N5' },
          { kanji: '木曜日', hiragana: 'もくようび', meaning_es: 'Jueves (Día de la madera)', level: 'N5' },
          { kanji: '金曜日', hiragana: 'きんようび', meaning_es: 'Viernes (Día del metal/oro)', level: 'N5' },
          { kanji: '土曜日', hiragana: 'どようび', meaning_es: 'Sábado (Día de la tierra)', level: 'N5' },
          { kanji: '日曜日', hiragana: 'にちようび', meaning_es: 'Domingo (Día del sol)', level: 'N5' }
        ]
      },
      {
        id: 'u1-l7-meses-ano',
        number: 7,
        title: 'Meses del año',
        japanese_title: '月 (がつ)',
        description: 'Los 12 meses del calendario anual',
        words: [
          { kanji: '一月', hiragana: 'いちがつ', meaning_es: 'Enero', level: 'N5' },
          { kanji: '二月', hiragana: 'にがつ', meaning_es: 'Febrero', level: 'N5' },
          { kanji: '三月', hiragana: 'さんがつ', meaning_es: 'Marzo', level: 'N5' },
          { kanji: '四月', hiragana: 'しがつ', meaning_es: 'Abril', level: 'N5' },
          { kanji: '五月', hiragana: 'ごがつ', meaning_es: 'Mayo', level: 'N5' },
          { kanji: '六月', hiragana: 'ろくがつ', meaning_es: 'Junio', level: 'N5' },
          { kanji: '七月', hiragana: 'しちがつ', meaning_es: 'Julio', level: 'N5' },
          { kanji: '八月', hiragana: 'はちがつ', meaning_es: 'Agosto', level: 'N5' },
          { kanji: '九月', hiragana: 'くがつ', meaning_es: 'Septiembre', level: 'N5' },
          { kanji: '十月', hiragana: 'じゅうがつ', meaning_es: 'Octubre', level: 'N5' },
          { kanji: '十一月', hiragana: 'じゅういちがつ', meaning_es: 'Noviembre', level: 'N5' },
          { kanji: '十二月', hiragana: 'じゅうにがつ', meaning_es: 'Diciembre', level: 'N5' }
        ]
      },
      {
        id: 'u1-l8-dias-mes-especiales',
        number: 8,
        title: 'Días del mes especiales',
        japanese_title: '日付・特別な読み方',
        description: 'Lecturas tradicionales de los días del mes',
        words: [
          { kanji: '一日', hiragana: 'ついたち', meaning_es: 'Día uno (primer día del mes)', level: 'N5' },
          { kanji: '二日', hiragana: 'ふつか', meaning_es: 'Día dos / Dos días', level: 'N5' },
          { kanji: '三日', hiragana: 'みっか', meaning_es: 'Día tres / Tres días', level: 'N5' },
          { kanji: '四日', hiragana: 'よっか', meaning_es: 'Día cuatro / Cuatro días', level: 'N5' },
          { kanji: '五日', hiragana: 'いつか', meaning_es: 'Día cinco / Cinco días', level: 'N5' },
          { kanji: '六日', hiragana: 'むいか', meaning_es: 'Día seis / Seis días', level: 'N5' },
          { kanji: '七日', hiragana: 'なのか', meaning_es: 'Día siete / Siete días', level: 'N5' },
          { kanji: '八日', hiragana: 'ようか', meaning_es: 'Día ocho / Ocho días', level: 'N5' },
          { kanji: '九日', hiragana: 'ここのか', meaning_es: 'Día nueve / Nueve días', level: 'N5' },
          { kanji: '十日', hiragana: 'とおか', meaning_es: 'Día diez / Diez días', level: 'N5' },
          { kanji: '二十日', hiragana: 'はつか', meaning_es: 'Día veinte / Veinte días', level: 'N5' }
        ]
      },
      {
        id: 'u1-l9-horas-minutos-periodos',
        number: 9,
        title: 'Horas, minutos y períodos del día',
        japanese_title: '時・分・一日の時間帯',
        description: 'Expresiones para consultar y decir la hora del día',
        words: [
          { kanji: '時', hiragana: 'じ', meaning_es: 'Hora / En punto', level: 'N5' },
          { kanji: '分', hiragana: 'ふん', meaning_es: 'Minuto', level: 'N5' },
          { kanji: '半', hiragana: 'はん', meaning_es: 'Y media (treinta minutos)', level: 'N5' },
          { kanji: '午前', hiragana: 'ごぜん', meaning_es: 'Mañana (a.m.)', level: 'N5' },
          { kanji: '午後', hiragana: 'ごご', meaning_es: 'Tarde / Noche (p.m.)', level: 'N5' },
          { kanji: '朝', hiragana: 'あさ', meaning_es: 'La mañana', level: 'N5' },
          { kanji: '昼', hiragana: 'ひる', meaning_es: 'Mediodía / Día', level: 'N5' },
          { kanji: '晩', hiragana: 'ばん', meaning_es: 'Tarde-noche', level: 'N5' },
          { kanji: '夜', hiragana: 'よる', meaning_es: 'Noche', level: 'N5' },
          { kanji: '今', hiragana: 'いま', meaning_es: 'Ahora', level: 'N5' },
          { kanji: '時間', hiragana: 'じかん', meaning_es: 'Tiempo / Horas (duración)', level: 'N5' },
          { kanji: '毎日', hiragana: 'まいにち', meaning_es: 'Todos los días / Diario', level: 'N5' }
        ]
      },
      {
        id: 'u1-l10-tiempo-relativo',
        number: 10,
        title: 'Tiempo relativo y fechas',
        japanese_title: '今日・明日・過去と未来',
        description: 'Ayer, hoy, mañana y secuencias temporales',
        words: [
          { kanji: '今日', hiragana: 'きょう', meaning_es: 'Hoy', level: 'N5' },
          { kanji: '明日', hiragana: 'あした', meaning_es: 'Mañana', level: 'N5' },
          { kanji: '昨日', hiragana: 'きのう', meaning_es: 'Ayer', level: 'N5' },
          { kanji: '一昨日', hiragana: 'おととい', meaning_es: 'Anteayer', level: 'N5' },
          { kanji: '明後日', hiragana: 'あさって', meaning_es: 'Pasado mañana', level: 'N5' },
          { kanji: '今週', hiragana: 'こんしゅう', meaning_es: 'Esta semana', level: 'N5' },
          { kanji: '来週', hiragana: 'らいしゅう', meaning_es: 'La próxima semana', level: 'N5' },
          { kanji: '先週', hiragana: 'せんしゅう', meaning_es: 'La semana pasada', level: 'N5' },
          { kanji: '今月', hiragana: 'こんげつ', meaning_es: 'Este mes', level: 'N5' },
          { kanji: '来月', hiragana: 'らいげつ', meaning_es: 'El próximo mes', level: 'N5' },
          { kanji: '先月', hiragana: 'せんげつ', meaning_es: 'El mes pasado', level: 'N5' },
          { kanji: '今年', hiragana: 'ことし', meaning_es: 'Este año', level: 'N5' }
        ]
      },
      {
        id: 'u1-l11-saludos-cortesia',
        number: 11,
        title: 'Saludos cotidianos y fórmulas de cortesía',
        japanese_title: '挨拶・日常表現',
        description: 'Frases clave para iniciar y cerrar conversaciones diarias',
        words: [
          { kanji: 'おはよう', hiragana: 'おはよう', meaning_es: 'Buenos días (informal)', level: 'N5' },
          { kanji: 'こんにちは', hiragana: 'こんにちは', meaning_es: 'Buenas tardes / Hola', level: 'N5' },
          { kanji: 'こんばんは', hiragana: 'こんばんは', meaning_es: 'Buenas noches (saludo)', level: 'N5' },
          { kanji: 'ありがとう', hiragana: 'ありがとう', meaning_es: 'Muchas gracias', level: 'N5' },
          { kanji: 'すみません', hiragana: 'すみません', meaning_es: 'Disculpe / Con permiso / Gracias', level: 'N5' },
          { kanji: 'さようなら', hiragana: 'さようなら', meaning_es: 'Adiós (formal)', level: 'N5' },
          { kanji: 'お願いします', hiragana: 'おねがいします', meaning_es: 'Por favor', level: 'N5' },
          { kanji: 'はじめまして', hiragana: 'はじめまして', meaning_es: 'Mucho gusto / Encantado', level: 'N5' },
          { kanji: 'ごめんなさい', hiragana: 'ごめんなさい', meaning_es: 'Lo siento / Perdón', level: 'N5' },
          { kanji: 'じゃあまた', hiragana: 'じゃあまた', meaning_es: 'Hasta luego / Nos vemos', level: 'N5' }
        ]
      },
      {
        id: 'u1-l12-pronombres-demostrativos',
        number: 12,
        title: 'Pronombres demostrativos y de lugar',
        japanese_title: '指示代名詞・場所',
        description: 'Señalar objetos y lugares cercanos y lejanos (Ko-So-A-Do)',
        words: [
          { kanji: 'これ', hiragana: 'これ', meaning_es: 'Esto (cerca de mí)', level: 'N5' },
          { kanji: 'それ', hiragana: 'それ', meaning_es: 'Eso (cerca de ti)', level: 'N5' },
          { kanji: 'あれ', hiragana: 'あれ', meaning_es: 'Aquello (lejos de ambos)', level: 'N5' },
          { kanji: 'どれ', hiragana: 'どれ', meaning_es: '¿Cuál?', level: 'N5' },
          { kanji: 'ここ', hiragana: 'ここ', meaning_es: 'Aquí (este lugar)', level: 'N5' },
          { kanji: 'そこ', hiragana: 'そこ', meaning_es: 'Ahí (ese lugar)', level: 'N5' },
          { kanji: 'あそこ', hiragana: 'あそこ', meaning_es: 'Allí / Allá (aquel lugar)', level: 'N5' },
          { kanji: 'どこ', hiragana: 'どこ', meaning_es: '¿Dónde? / ¿Qué lugar?', level: 'N5' },
          { kanji: 'こちら', hiragana: 'こちら', meaning_es: 'Por aquí / Este lado (cortés)', level: 'N5' },
          { kanji: 'そちら', hiragana: 'そちら', meaning_es: 'Por ahí / Ese lado (cortés)', level: 'N5' }
        ]
      },
      {
        id: 'u1-l13-pronombres-personales',
        number: 13,
        title: 'Pronombres personales y personas',
        japanese_title: '人称代名詞・人物',
        description: 'Referirse a uno mismo, al interlocutor y a terceros',
        words: [
          { kanji: '私', hiragana: 'わたし', meaning_es: 'Yo (primera persona estándar)', level: 'N5' },
          { kanji: 'あなた', hiragana: 'あなた', meaning_es: 'Tú / Usted', level: 'N5' },
          { kanji: '彼', hiragana: 'かれ', meaning_es: 'Él / Novio', level: 'N4' },
          { kanji: '彼女', hiragana: 'かのじょ', meaning_es: 'Ella / Novia', level: 'N4' },
          { kanji: '私たち', hiragana: 'わたしたち', meaning_es: 'Nosotros', level: 'N5' },
          { kanji: '彼ら', hiragana: 'かれら', meaning_es: 'Ellos', level: 'N4' },
          { kanji: '誰', hiragana: 'だれ', meaning_es: '¿Quién?', level: 'N5' },
          { kanji: '先生', hiragana: 'せんせい', meaning_es: 'Profesor / Maestro / Doctor', level: 'N5' },
          { kanji: '皆さん', hiragana: 'みなさん', meaning_es: 'Todos ustedes / Damas y caballeros', level: 'N5' },
          { kanji: '自分', hiragana: 'じぶん', meaning_es: 'Uno mismo / Por sí mismo', level: 'N4' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // UNIDAD 2: Animales, Colores, Formas y Naturaleza
  // -------------------------------------------------------------
  {
    id: 'unit-2-animales-naturaleza',
    title: 'Unidad 2: Animales, Colores, Formas y Naturaleza',
    japanese_title: '動物・色・形・自然環境',
    subtitle: 'Mascotas, fauna salvaje, aves, vida marina, insectos, colores y paisajes',
    kanji_icon: '動',
    color: '#0284c7',
    bg_gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u2-l1-mascotas-comunes',
        number: 1,
        title: 'Mascotas comunes',
        japanese_title: 'ペット・身近な動物',
        description: 'Animales de compañía y convivencia hogareña',
        words: [
          { kanji: '犬', hiragana: 'いぬ', meaning_es: 'Perro', level: 'N5' },
          { kanji: '猫', hiragana: 'ねこ', meaning_es: 'Gato', level: 'N5' },
          { kanji: '小鳥', hiragana: 'ことり', meaning_es: 'Pajarito / Ave pequeña', level: 'N5' },
          { kanji: 'ハムスター', hiragana: 'はむすたー', meaning_es: 'Hámster', level: 'N5' },
          { kanji: 'うさぎ', hiragana: 'うさぎ', meaning_es: 'Conejo', level: 'N5' },
          { kanji: '金魚', hiragana: 'きんぎょ', meaning_es: 'Pez dorado', level: 'N4' },
          { kanji: '子犬', hiragana: 'こいぬ', meaning_es: 'Cachorro de perro', level: 'N5' },
          { kanji: '子猫', hiragana: 'こねこ', meaning_es: 'Gatito', level: 'N5' },
          { kanji: '亀', hiragana: 'かめ', meaning_es: 'Tortuga', level: 'N4' },
          { kanji: '飼う', hiragana: 'かう', meaning_es: 'Criar / Tener una mascota', level: 'N4' }
        ]
      },
      {
        id: 'u2-l2-animales-salvajes',
        number: 2,
        title: 'Animales salvajes y de zoológico',
        japanese_title: '野生動物・動物園の動物',
        description: 'Grandes mamíferos y depredadores terrestres',
        words: [
          { kanji: 'ライオン', hiragana: 'らいおん', meaning_es: 'León', level: 'N5' },
          { kanji: '虎', hiragana: 'とら', meaning_es: 'Tigre', level: 'N4' },
          { kanji: '象', hiragana: 'ぞう', meaning_es: 'Elefante', level: 'N5' },
          { kanji: '熊', hiragana: 'くま', meaning_es: 'Oso', level: 'N4' },
          { kanji: '猿', hiragana: 'さる', meaning_es: 'Mono', level: 'N4' },
          { kanji: 'キリン', hiragana: 'きりん', meaning_es: 'Jirafa', level: 'N5' },
          { kanji: 'パンダ', hiragana: 'ぱんだ', meaning_es: 'Panda', level: 'N5' },
          { kanji: '狼', hiragana: 'おおかみ', meaning_es: 'Lobo', level: 'N4' },
          { kanji: '狐', hiragana: 'きつね', meaning_es: 'Zorro', level: 'N4' },
          { kanji: '鹿', hiragana: 'しか', meaning_es: 'Ciervo / Venado', level: 'N4' },
          { kanji: '動物', hiragana: 'どうぶつ', meaning_es: 'Animal (concepto general)', level: 'N5' },
          { kanji: '動物園', hiragana: 'どうぶつえん', meaning_es: 'Zoológico', level: 'N5' }
        ]
      },
      {
        id: 'u2-l3-animales-granja',
        number: 3,
        title: 'Animales de granja y campo',
        japanese_title: '家畜・牧場の動物',
        description: 'Especies domesticadas de corral y pastoreo',
        words: [
          { kanji: '牛', hiragana: 'うし', meaning_es: 'Vaca / Buey', level: 'N5' },
          { kanji: '馬', hiragana: 'うま', meaning_es: 'Caballo', level: 'N5' },
          { kanji: '豚', hiragana: 'ぶた', meaning_es: 'Cerdo', level: 'N5' },
          { kanji: '羊', hiragana: 'ひつじ', meaning_es: 'Oveja', level: 'N4' },
          { kanji: '山羊', hiragana: 'やぎ', meaning_es: 'Cabra', level: 'N4' },
          { kanji: '鶏', hiragana: 'にわとり', meaning_es: 'Gallo / Gallina', level: 'N5' },
          { kanji: 'アヒル', hiragana: 'あひる', meaning_es: 'Pato doméstico', level: 'N5' },
          { kanji: '牧場', hiragana: 'ぼくじょう', meaning_es: 'Granja / Rancho ganadero', level: 'N4' },
          { kanji: '卵', hiragana: 'たまご', meaning_es: 'Huevo', level: 'N5' },
          { kanji: '牛乳', hiragana: 'ぎゅうにゅう', meaning_es: 'Leche de vaca', level: 'N5' }
        ]
      },
      {
        id: 'u2-l4-aves-pajaros',
        number: 4,
        title: 'Aves y pájaros',
        japanese_title: '鳥類・空を飛ぶ鳥',
        description: 'Aves silvestres, rapaces y acuáticas',
        words: [
          { kanji: '鳥', hiragana: 'とり', meaning_es: 'Pájaro / Ave', level: 'N5' },
          { kanji: '雀', hiragana: 'すずめ', meaning_es: 'Gorrión', level: 'N4' },
          { kanji: '烏', hiragana: 'からす', meaning_es: 'Cuervo', level: 'N4' },
          { kanji: '鳩', hiragana: 'はと', meaning_es: 'Paloma', level: 'N4' },
          { kanji: '鷹', hiragana: 'たか', meaning_es: 'Halcón', level: 'N4' },
          { kanji: '鷲', hiragana: 'わし', meaning_es: 'Águila', level: 'N4' },
          { kanji: '鴨', hiragana: 'かも', meaning_es: 'Pato silvestre', level: 'N4' },
          { kanji: '白鳥', hiragana: 'はくちょう', meaning_es: 'Cisne', level: 'N4' },
          { kanji: '燕', hiragana: 'つばめ', meaning_es: 'Golondrina', level: 'N4' },
          { kanji: '羽', hiragana: 'はね', meaning_es: 'Pluma / Ala', level: 'N4' }
        ]
      },
      {
        id: 'u2-l5-criaturas-marinas',
        number: 5,
        title: 'Peces y criaturas marinas',
        japanese_title: '魚類・海の生物',
        description: 'Habitantes del océano, ríos y lagos',
        words: [
          { kanji: '魚', hiragana: 'さかな', meaning_es: 'Pescado / Pez', level: 'N5' },
          { kanji: '鯨', hiragana: 'くじら', meaning_es: 'Ballena', level: 'N4' },
          { kanji: 'イルカ', hiragana: 'いるか', meaning_es: 'Delfín', level: 'N5' },
          { kanji: '鮫', hiragana: 'さめ', meaning_es: 'Tiburón', level: 'N4' },
          { kanji: '蛸', hiragana: 'たこ', meaning_es: 'Pulpo', level: 'N4' },
          { kanji: '烏賊', hiragana: 'いか', meaning_es: 'Calamar', level: 'N4' },
          { kanji: '蟹', hiragana: 'かに', meaning_es: 'Cangrejo', level: 'N4' },
          { kanji: '海老', hiragana: 'えび', meaning_es: 'Camarón / Gamba', level: 'N4' },
          { kanji: '貝', hiragana: 'かい', meaning_es: 'Molusco / Almeja / Concha', level: 'N4' },
          { kanji: '鮭', hiragana: 'さけ', meaning_es: 'Salmón', level: 'N4' },
          { kanji: '鮪', hiragana: 'まぐろ', meaning_es: 'Atún', level: 'N4' },
          { kanji: '水族館', hiragana: 'すいぞくかん', meaning_es: 'Acuario público', level: 'N4' }
        ]
      },
      {
        id: 'u2-l6-insectos-bichos',
        number: 6,
        title: 'Insectos y pequeños animales',
        japanese_title: '昆虫・小さな生き物',
        description: 'Insectos voladores, rastreros y polinizadores',
        words: [
          { kanji: '虫', hiragana: 'むし', meaning_es: 'Insecto / Bicho', level: 'N5' },
          { kanji: '蝶', hiragana: 'ちょう', meaning_es: 'Mariposa', level: 'N4' },
          { kanji: '蜂', hiragana: 'はち', meaning_es: 'Abeja / Avispa', level: 'N4' },
          { kanji: '蟻', hiragana: 'あり', meaning_es: 'Hormiga', level: 'N4' },
          { kanji: '蚊', hiragana: 'か', meaning_es: 'Mosquito', level: 'N4' },
          { kanji: '蝿', hiragana: 'はえ', meaning_es: 'Mosca', level: 'N4' },
          { kanji: '蜘蛛', hiragana: 'くも', meaning_es: 'Araña', level: 'N4' },
          { kanji: '蝉', hiragana: 'せみ', meaning_es: 'Cigarra', level: 'N4' },
          { kanji: 'カブトムシ', hiragana: 'かぶとむし', meaning_es: 'Escarabajo rinoceronte', level: 'N5' },
          { kanji: '蛍', hiragana: 'ほたる', meaning_es: 'Luciérnaga', level: 'N4' }
        ]
      },
      {
        id: 'u2-l7-reptiles-anfibios',
        number: 7,
        title: 'Reptiles y anfibios',
        japanese_title: '爬虫類・両生類',
        description: 'Serpientes, ranas, tortugas y lagartos',
        words: [
          { kanji: '亀', hiragana: 'かめ', meaning_es: 'Tortuga terrestre o marina', level: 'N4' },
          { kanji: '蛇', hiragana: 'へび', meaning_es: 'Serpiente / Culebra', level: 'N4' },
          { kanji: '蛙', hiragana: 'かえる', meaning_es: 'Rana', level: 'N4' },
          { kanji: '蜥蜴', hiragana: 'とかげ', meaning_es: 'Lagartija / Lagarto', level: 'N4' },
          { kanji: '鰐', hiragana: 'わに', meaning_es: 'Cocodrilo', level: 'N4' },
          { kanji: 'ヤモリ', hiragana: 'やもり', meaning_es: 'Gueco casero', level: 'N5' },
          { kanji: 'オタマジャクシ', hiragana: 'おたまじゃくし', meaning_es: 'Renacuajo', level: 'N5' },
          { kanji: '池', hiragana: 'いけ', meaning_es: 'Estanque / Laguna', level: 'N5' }
        ]
      },
      {
        id: 'u2-l8-colores-principales',
        number: 8,
        title: 'Colores principales',
        japanese_title: '基本の色 (いろ)',
        description: 'Gama cromática fundamental y adjetivos de color',
        words: [
          { kanji: '赤', hiragana: 'あか', meaning_es: 'Rojo (sustantivo)', level: 'N5' },
          { kanji: '赤い', hiragana: 'あかい', meaning_es: 'Rojo (adjetivo)', level: 'N5' },
          { kanji: '青', hiragana: 'あお', meaning_es: 'Azul (sustantivo)', level: 'N5' },
          { kanji: '青い', hiragana: 'あおい', meaning_es: 'Azul (adjetivo)', level: 'N5' },
          { kanji: '白', hiragana: 'しろ', meaning_es: 'Blanco (sustantivo)', level: 'N5' },
          { kanji: '白い', hiragana: 'しろい', meaning_es: 'Blanco (adjetivo)', level: 'N5' },
          { kanji: '黒', hiragana: 'くろ', meaning_es: 'Negro (sustantivo)', level: 'N5' },
          { kanji: '黒い', hiragana: 'くろい', meaning_es: 'Negro (adjetivo)', level: 'N5' },
          { kanji: '黄色', hiragana: 'きいろ', meaning_es: 'Amarillo', level: 'N5' },
          { kanji: '緑', hiragana: 'みどり', meaning_es: 'Verde', level: 'N5' },
          { kanji: '茶色', hiragana: 'ちゃいろ', meaning_es: 'Marrón / Castaño', level: 'N5' },
          { kanji: '紫', hiragana: 'むらさき', meaning_es: 'Morado / Violeta', level: 'N4' }
        ]
      },
      {
        id: 'u2-l9-formas-dimensiones',
        number: 9,
        title: 'Formas geométricas y dimensiones',
        japanese_title: '形・図形・サイズ',
        description: 'Círculos, cuadrados, longitud, grosor y proporciones',
        words: [
          { kanji: '丸', hiragana: 'まる', meaning_es: 'Círculo / Redondo', level: 'N5' },
          { kanji: '四角', hiragana: 'しかく', meaning_es: 'Cuadrado / Rectángulo', level: 'N4' },
          { kanji: '三角', hiragana: 'さんかく', meaning_es: 'Triángulo', level: 'N4' },
          { kanji: '形', hiragana: 'かたち', meaning_es: 'Forma / Figura', level: 'N4' },
          { kanji: '大きい', hiragana: 'おおきい', meaning_es: 'Grande', level: 'N5' },
          { kanji: '小さい', hiragana: 'ちいさい', meaning_es: 'Pequeño', level: 'N5' },
          { kanji: '長い', hiragana: 'ながい', meaning_es: 'Largo', level: 'N5' },
          { kanji: '短い', hiragana: 'みじかい', meaning_es: 'Corto', level: 'N5' },
          { kanji: '太い', hiragana: 'ふとい', meaning_es: 'Grueso / Gordo', level: 'N5' },
          { kanji: '細い', hiragana: 'ほそい', meaning_es: 'Delgado / Fino', level: 'N5' }
        ]
      },
      {
        id: 'u2-l10-elementos-paisaje',
        number: 10,
        title: 'Elementos de la naturaleza y paisajes',
        japanese_title: '自然風景・山河',
        description: 'Montañas, ríos, el mar, los astros y la vegetación',
        words: [
          { kanji: '山', hiragana: 'やま', meaning_es: 'Montaña', level: 'N5' },
          { kanji: '川', hiragana: 'かわ', meaning_es: 'Río', level: 'N5' },
          { kanji: '海', hiragana: 'うみ', meaning_es: 'Mar / Océano', level: 'N5' },
          { kanji: '空', hiragana: 'そら', meaning_es: 'Cielo', level: 'N5' },
          { kanji: '太陽', hiragana: 'たいよう', meaning_es: 'Sol', level: 'N4' },
          { kanji: '月', hiragana: 'つき', meaning_es: 'Luna', level: 'N5' },
          { kanji: '星', hiragana: 'ほし', meaning_es: 'Estrella', level: 'N4' },
          { kanji: '森', hiragana: 'もり', meaning_es: 'Bosque frondoso', level: 'N4' },
          { kanji: '林', hiragana: 'はやし', meaning_es: 'Arboleda / Bosquecillo', level: 'N4' },
          { kanji: '花', hiragana: 'はな', meaning_es: 'Flor', level: 'N5' },
          { kanji: '木', hiragana: 'き', meaning_es: 'Árbol / Madera', level: 'N5' },
          { kanji: '草', hiragana: 'くさ', meaning_es: 'Hierba / Pasto', level: 'N4' }
        ]
      },
      {
        id: 'u2-l11-clima-estaciones',
        number: 11,
        title: 'Clima, tiempo atmosférico y estaciones',
        japanese_title: '季節・天気・気象',
        description: 'Las 4 estaciones del año y fenómenos meteorológicos',
        words: [
          { kanji: '春', hiragana: 'はる', meaning_es: 'Primavera', level: 'N5' },
          { kanji: '夏', hiragana: 'なつ', meaning_es: 'Verano', level: 'N5' },
          { kanji: '秋', hiragana: 'あき', meaning_es: 'Otoño', level: 'N5' },
          { kanji: '冬', hiragana: 'ふゆ', meaning_es: 'Invierno', level: 'N5' },
          { kanji: '天気', hiragana: 'てんき', meaning_es: 'Tiempo meteorológico / Clima', level: 'N5' },
          { kanji: '雨', hiragana: 'あめ', meaning_es: 'Lluvia', level: 'N5' },
          { kanji: '雪', hiragana: 'ゆき', meaning_es: 'Nieve', level: 'N5' },
          { kanji: '風', hiragana: 'かぜ', meaning_es: 'Viento', level: 'N5' },
          { kanji: '雲', hiragana: 'くも', meaning_es: 'Nube', level: 'N4' },
          { kanji: '晴れ', hiragana: 'はれ', meaning_es: 'Despejado / Día soleado', level: 'N5' },
          { kanji: '曇り', hiragana: 'くもり', meaning_es: 'Nublado', level: 'N5' },
          { kanji: '台風', hiragana: 'たいふう', meaning_es: 'Tifón', level: 'N4' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // UNIDAD 3: El Cuerpo Humano y la Salud
  // -------------------------------------------------------------
  {
    id: 'unit-3-cuerpo-salud',
    title: 'Unidad 3: El Cuerpo Humano y la Salud',
    japanese_title: '身体・健康・医学',
    subtitle: 'Anatomía, partes corporales, sentidos, fisiología, síntomas y hospital',
    kanji_icon: '体',
    color: '#e11d48',
    bg_gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u3-l1-cabeza-rostro',
        number: 1,
        title: 'Cabeza y rostro',
        japanese_title: '頭・顔の部分',
        description: 'Facciones superiores, cabello y rasgos faciales',
        words: [
          { kanji: '頭', hiragana: 'あたま', meaning_es: 'Cabeza', level: 'N5' },
          { kanji: '顔', hiragana: 'かお', meaning_es: 'Cara / Rostro', level: 'N5' },
          { kanji: '髪', hiragana: 'かみ', meaning_es: 'Cabello / Pelo', level: 'N4' },
          { kanji: '額', hiragana: 'ひたい', meaning_es: 'Frente', level: 'N3' },
          { kanji: '頬', hiragana: 'ほほ', meaning_es: 'Mejilla', level: 'N3' },
          { kanji: '顎', hiragana: 'あご', meaning_es: 'Barbilla / Mandíbula', level: 'N3' },
          { kanji: '髭', hiragana: 'ひげ', meaning_es: 'Barba / Bigote', level: 'N4' },
          { kanji: '首', hiragana: 'くび', meaning_es: 'Cuello', level: 'N4' },
          { kanji: '頭痛', hiragana: 'ずつう', meaning_es: 'Dolor de cabeza', level: 'N4' },
          { kanji: '表情', hiragana: 'ひょうじょう', meaning_es: 'Expresión facial', level: 'N3' }
        ]
      },
      {
        id: 'u3-l2-ojos-orejas-boca',
        number: 2,
        title: 'Ojos, orejas, nariz y boca',
        japanese_title: '目・耳・鼻・口',
        description: 'Órganos sensoriales faciales y cavidad bucal',
        words: [
          { kanji: '目', hiragana: 'め', meaning_es: 'Ojo / Ojos', level: 'N5' },
          { kanji: '耳', hiragana: 'みみ', meaning_es: 'Oreja / Oído', level: 'N5' },
          { kanji: '鼻', hiragana: 'はな', meaning_es: 'Nariz', level: 'N5' },
          { kanji: '口', hiragana: 'くち', meaning_es: 'Boca', level: 'N5' },
          { kanji: '唇', hiragana: 'くちびる', meaning_es: 'Labios', level: 'N3' },
          { kanji: '歯', hiragana: 'は', meaning_es: 'Diente / Dientes', level: 'N5' },
          { kanji: '舌', hiragana: 'した', meaning_es: 'Lengua', level: 'N3' },
          { kanji: '眉毛', hiragana: 'まゆげ', meaning_es: 'Ceja', level: 'N4' },
          { kanji: '涙', hiragana: 'なみだ', meaning_es: 'Lágrima', level: 'N4' },
          { kanji: '声', hiragana: 'こえ', meaning_es: 'Voz', level: 'N5' }
        ]
      },
      {
        id: 'u3-l3-brazos-manos',
        number: 3,
        title: 'Brazos, manos y dedos',
        japanese_title: '腕・手・指先',
        description: 'Extremidades superiores, articulaciones y dedos',
        words: [
          { kanji: '手', hiragana: 'て', meaning_es: 'Mano', level: 'N5' },
          { kanji: '腕', hiragana: 'うで', meaning_es: 'Brazo', level: 'N4' },
          { kanji: '指', hiragana: 'ゆび', meaning_es: 'Dedo', level: 'N5' },
          { kanji: '爪', hiragana: 'つめ', meaning_es: 'Uña', level: 'N3' },
          { kanji: '肘', hiragana: 'ひじ', meaning_es: 'Codo', level: 'N3' },
          { kanji: '肩', hiragana: 'かた', meaning_es: 'Hombro', level: 'N4' },
          { kanji: '手首', hiragana: 'てくび', meaning_es: 'Muñeca de la mano', level: 'N4' },
          { kanji: '親指', hiragana: 'おやゆび', meaning_es: 'Dedo pulgar', level: 'N4' },
          { kanji: '握手', hiragana: 'あくしゅ', meaning_es: 'Apretón de manos', level: 'N4' },
          { kanji: '右手', hiragana: 'みぎて', meaning_es: 'Mano derecha', level: 'N5' }
        ]
      },
      {
        id: 'u3-l4-piernas-pies-tronco',
        number: 4,
        title: 'Piernas, pies y tronco',
        japanese_title: '足・脚・胴体',
        description: 'Extremidades inferiores, torso y postura',
        words: [
          { kanji: '足', hiragana: 'あし', meaning_es: 'Pie / Pierna', level: 'N5' },
          { kanji: '膝', hiragana: 'ひざ', meaning_es: 'Rodilla', level: 'N3' },
          { kanji: '胸', hiragana: 'むね', meaning_es: 'Pecho', level: 'N4' },
          { kanji: '背中', hiragana: 'せなか', meaning_es: 'Espalda', level: 'N4' },
          { kanji: '腰', hiragana: 'こし', meaning_es: 'Cintura / Cadera / Zona lumbar', level: 'N4' },
          { kanji: 'お腹', hiragana: 'おなか', meaning_es: 'Estómago / Barriga', level: 'N5' },
          { kanji: '尻', hiragana: 'しり', meaning_es: 'Glúteos / Trasero', level: 'N3' },
          { kanji: '骨', hiragana: 'ほね', meaning_es: 'Hueso', level: 'N4' },
          { kanji: '体', hiragana: 'からだ', meaning_es: 'Cuerpo humano', level: 'N5' },
          { kanji: '左足', hiragana: 'ひだりあし', meaning_es: 'Pie / Pierna izquierda', level: 'N5' }
        ]
      },
      {
        id: 'u3-l5-organos-fisiologia',
        number: 5,
        title: 'Órganos internos y fisiología',
        japanese_title: '内臓・血液・呼吸',
        description: 'Corazón, respiración, sangre y musculatura',
        words: [
          { kanji: '心臓', hiragana: 'しんぞう', meaning_es: 'Corazón (órgano anatómico)', level: 'N4' },
          { kanji: '胃', hiragana: 'い', meaning_es: 'Estómago (órgano interno)', level: 'N4' },
          { kanji: '脳', hiragana: 'のう', meaning_es: 'Cerebro', level: 'N3' },
          { kanji: '血液', hiragana: 'けつえき', meaning_es: 'Sangre', level: 'N4' },
          { kanji: '筋肉', hiragana: 'きんにく', meaning_es: 'Músculo', level: 'N4' },
          { kanji: '息', hiragana: 'いき', meaning_es: 'Aliento / Respiración', level: 'N4' },
          { kanji: '汗', hiragana: 'あせ', meaning_es: 'Sudor', level: 'N4' },
          { kanji: '血', hiragana: 'ち', meaning_es: 'Sangre (forma pura)', level: 'N4' },
          { kanji: '熱', hiragana: 'ねつ', meaning_es: 'Fiebre / Calor corporal', level: 'N5' },
          { kanji: '力', hiragana: 'ちから', meaning_es: 'Fuerza física / Energía', level: 'N5' }
        ]
      },
      {
        id: 'u3-l6-sintomas-enfermedades',
        number: 6,
        title: 'Síntomas médicos y enfermedades',
        japanese_title: '症状・風邪・痛み',
        description: 'Molestias físicas, dolores y malestar común',
        words: [
          { kanji: '風邪', hiragana: 'かぜ', meaning_es: 'Resfriado común', level: 'N5' },
          { kanji: '痛い', hiragana: 'いたい', meaning_es: 'Doloroso / Me duele', level: 'N5' },
          { kanji: '咳', hiragana: 'せき', meaning_es: 'Tos', level: 'N4' },
          { kanji: '吐き気', hiragana: 'はきけ', meaning_es: 'Náuseas', level: 'N3' },
          { kanji: '怪我', hiragana: 'けが', meaning_es: 'Herida / Lesión', level: 'N4' },
          { kanji: 'だるい', hiragana: 'だるい', meaning_es: 'Lánguido / Fatigado / Sin energía', level: 'N4' },
          { kanji: '病気', hiragana: 'びょうき', meaning_es: 'Enfermedad', level: 'N5' },
          { kanji: '具合', hiragana: 'ぐあい', meaning_es: 'Estado de salud / Condición física', level: 'N4' },
          { kanji: '気分', hiragana: 'きぶん', meaning_es: 'Estado de ánimo / Sentirse bien o mal', level: 'N4' },
          { kanji: '折れる', hiragana: 'おれる', meaning_es: 'Fracturarse / Romperse un hueso', level: 'N4' }
        ]
      },
      {
        id: 'u3-l7-hospital-medicamentos',
        number: 7,
        title: 'Hospital, medicamentos y recuperación',
        japanese_title: '病院・薬・治療',
        description: 'Visita médica, fármacos, recetas y sanación',
        words: [
          { kanji: '病院', hiragana: 'びょういん', meaning_es: 'Hospital', level: 'N5' },
          { kanji: '医者', hiragana: 'いしゃ', meaning_es: 'Médico / Doctor', level: 'N5' },
          { kanji: '看護師', hiragana: 'かんごし', meaning_es: 'Enfermero / Enfermera', level: 'N4' },
          { kanji: '薬', hiragana: 'くすり', meaning_es: 'Medicina / Medicamento', level: 'N5' },
          { kanji: '注射', hiragana: 'ちゅうしゃ', meaning_es: 'Inyección', level: 'N4' },
          { kanji: '手術', hiragana: 'しゅじゅつ', meaning_es: 'Cirugía / Operación', level: 'N4' },
          { kanji: '診察', hiragana: 'しんさつ', meaning_es: 'Consulta / Examen médico', level: 'N4' },
          { kanji: '保険証', hiragana: 'ほけんしょう', meaning_es: 'Tarjeta del seguro de salud', level: 'N4' },
          { kanji: '元気', hiragana: 'げんき', meaning_es: 'Sano / Con energía / Bien', level: 'N5' },
          { kanji: '治る', hiragana: 'なおる', meaning_es: 'Curarse / Recuperarse de enfermedad', level: 'N4' }
        ]
      },
      {
        id: 'u3-l8-sentidos-sensaciones',
        number: 8,
        title: 'Sentidos y sensaciones físicas',
        japanese_title: '五感・触覚・感覚',
        description: 'Vista, oído, tacto, temperatura corporal y sabor',
        words: [
          { kanji: '見る', hiragana: 'みる', meaning_es: 'Ver / Mirar', level: 'N5' },
          { kanji: '聞く', hiragana: 'きく', meaning_es: 'Escuchar / Oír', level: 'N5' },
          { kanji: '匂い', hiragana: 'におい', meaning_es: 'Olor / Aroma', level: 'N4' },
          { kanji: '味', hiragana: 'あじ', meaning_es: 'Sabor', level: 'N4' },
          { kanji: '触る', hiragana: 'さわる', meaning_es: 'Tocar / Palpar', level: 'N4' },
          { kanji: '暑い', hiragana: 'あつい', meaning_es: 'Caluroso (clima)', level: 'N5' },
          { kanji: '寒い', hiragana: 'さむい', meaning_es: 'Frío (clima)', level: 'N5' },
          { kanji: '暖かい', hiragana: 'あたたかい', meaning_es: 'Cálido / Templado', level: 'N5' },
          { kanji: '涼しい', hiragana: 'すずしい', meaning_es: 'Fresco y agradable', level: 'N5' },
          { kanji: '痛む', hiragana: 'いたむ', meaning_es: 'Doler / Sentir dolor', level: 'N4' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // UNIDAD 4: La Familia, el Hogar y la Vida Diaria
  // -------------------------------------------------------------
  {
    id: 'unit-4-familia-hogar',
    title: 'Unidad 4: La Familia, el Hogar y la Vida Diaria',
    japanese_title: '家族・住まい・日常生活',
    subtitle: 'Familiares, estancias de la vivienda, electrodomésticos, rutina y ropa',
    kanji_icon: '家',
    color: '#f59e0b',
    bg_gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u4-l1-familia-inmediata',
        number: 1,
        title: 'Familia inmediata y padres',
        japanese_title: '家族・両親・子供',
        description: 'Núcleo familiar, progenitores e hijos',
        words: [
          { kanji: '家族', hiragana: 'かぞく', meaning_es: 'Familia', level: 'N5' },
          { kanji: '父', hiragana: 'ちち', meaning_es: 'Padre (mi padre)', level: 'N5' },
          { kanji: '母', hiragana: 'はは', meaning_es: 'Madre (mi madre)', level: 'N5' },
          { kanji: '両親', hiragana: 'りょうしん', meaning_es: 'Padres / Progenitores', level: 'N5' },
          { kanji: 'お父さん', hiragana: 'おとうさん', meaning_es: 'Padre (de otra persona / apelativo respetuoso)', level: 'N5' },
          { kanji: 'お母さん', hiragana: 'おかあさん', meaning_es: 'Madre (de otra persona / apelativo respetuoso)', level: 'N5' },
          { kanji: '夫', hiragana: 'おっと', meaning_es: 'Marido / Esposo (el mío)', level: 'N4' },
          { kanji: '妻', hiragana: 'つま', meaning_es: 'Esposa / Mujer (la mía)', level: 'N4' },
          { kanji: '子供', hiragana: 'こども', meaning_es: 'Hijo / Niño', level: 'N5' },
          { kanji: '親', hiragana: 'おや', meaning_es: 'Padre o madre (progenitor)', level: 'N4' }
        ]
      },
      {
        id: 'u4-l2-hermanos-abuelos',
        number: 2,
        title: 'Hermanos, abuelos y parientes',
        japanese_title: '兄弟・祖父母・親戚',
        description: 'Hermanos mayores, menores, abuelos y tíos',
        words: [
          { kanji: '兄', hiragana: 'あに', meaning_es: 'Hermano mayor (mi hermano)', level: 'N5' },
          { kanji: 'お兄さん', hiragana: 'おにいさん', meaning_es: 'Hermano mayor (respetuoso)', level: 'N5' },
          { kanji: '姉', hiragana: 'あね', meaning_es: 'Hermana mayor (mi hermana)', level: 'N5' },
          { kanji: 'お姉さん', hiragana: 'おねえさん', meaning_es: 'Hermana mayor (respetuoso)', level: 'N5' },
          { kanji: '弟', hiragana: 'おとうと', meaning_es: 'Hermano menor', level: 'N5' },
          { kanji: '妹', hiragana: 'いもうと', meaning_es: 'Hermana menor', level: 'N5' },
          { kanji: '祖父', hiragana: 'そふ', meaning_es: 'Abuelo (mi abuelo)', level: 'N5' },
          { kanji: '祖母', hiragana: 'そぼ', meaning_es: 'Abuela (mi abuela)', level: 'N5' },
          { kanji: '叔父', hiragana: 'おじ', meaning_es: 'Tío', level: 'N4' },
          { kanji: '叔母', hiragana: 'おば', meaning_es: 'Tía', level: 'N4' }
        ]
      },
      {
        id: 'u4-l3-habitaciones-vivienda',
        number: 3,
        title: 'Partes de la vivienda y habitaciones',
        japanese_title: '住居・部屋の構成',
        description: 'Estancias, entrada, cocina y jardín del hogar',
        words: [
          { kanji: '家', hiragana: 'いえ', meaning_es: 'Casa / Hogar', level: 'N5' },
          { kanji: '部屋', hiragana: 'へや', meaning_es: 'Habitación / Cuarto', level: 'N5' },
          { kanji: '玄関', hiragana: 'げんかん', meaning_es: 'Entrada / Vestíbulo principal', level: 'N5' },
          { kanji: '居間', hiragana: 'いま', meaning_es: 'Sala de estar / Salón', level: 'N4' },
          { kanji: '台所', hiragana: 'だいどころ', meaning_es: 'Cocina', level: 'N5' },
          { kanji: '風呂場', hiragana: 'ふろば', meaning_es: 'Cuarto de baño (bañera)', level: 'N4' },
          { kanji: 'トイレ', hiragana: 'といれ', meaning_es: 'Inodoro / Aseo', level: 'N5' },
          { kanji: '庭', hiragana: 'にわ', meaning_es: 'Jardín / Patio', level: 'N5' },
          { kanji: '窓', hiragana: 'まど', meaning_es: 'Ventana', level: 'N5' },
          { kanji: 'ドア', hiragana: 'どあ', meaning_es: 'Puerta', level: 'N5' }
        ]
      },
      {
        id: 'u4-l4-muebles-enseres',
        number: 4,
        title: 'Muebles y enseres del hogar',
        japanese_title: '家具・生活用品',
        description: 'Mobiliario indispensable y objetos cotidianos',
        words: [
          { kanji: '机', hiragana: 'つくえ', meaning_es: 'Escritorio / Mesa de trabajo', level: 'N5' },
          { kanji: '椅子', hiragana: 'いす', meaning_es: 'Silla', level: 'N5' },
          { kanji: 'ベッド', hiragana: 'べっど', meaning_es: 'Cama', level: 'N5' },
          { kanji: '本棚', hiragana: 'ほんだな', meaning_es: 'Estantería de libros', level: 'N5' },
          { kanji: '鏡', hiragana: 'かがみ', meaning_es: 'Espejo', level: 'N4' },
          { kanji: '時計', hiragana: 'とけい', meaning_es: 'Reloj', level: 'N5' },
          { kanji: '電気', hiragana: 'でんき', meaning_es: 'Electricidad / Luz de techo', level: 'N5' },
          { kanji: '鍵', hiragana: 'かぎ', meaning_es: 'Llave', level: 'N5' },
          { kanji: '電話', hiragana: 'でんわ', meaning_es: 'Teléfono', level: 'N5' },
          { kanji: 'テレビ', hiragana: 'てれび', meaning_es: 'Televisión', level: 'N5' }
        ]
      },
      {
        id: 'u4-l5-electrodomesticos-cocina',
        number: 5,
        title: 'Electrodomésticos y cocina',
        japanese_title: '家電・台所用具',
        description: 'Nevera, lavadora, microondas y vajilla',
        words: [
          { kanji: '冷蔵庫', hiragana: 'れいぞうこ', meaning_es: 'Nevera / Refrigerador', level: 'N5' },
          { kanji: '洗濯機', hiragana: 'せんたくき', meaning_es: 'Lavadora', level: 'N4' },
          { kanji: '電子レンジ', hiragana: 'でんしれんじ', meaning_es: 'Horno microondas', level: 'N4' },
          { kanji: 'エアコン', hiragana: 'えあこん', meaning_es: 'Aire acondicionado / Calefacción', level: 'N5' },
          { kanji: '掃除機', hiragana: 'そうじき', meaning_es: 'Aspiradora', level: 'N4' },
          { kanji: '炊飯器', hiragana: 'すいはんき', meaning_es: 'Arrocera eléctrica', level: 'N4' },
          { kanji: '包丁', hiragana: 'ほうちょう', meaning_es: 'Cuchillo de cocina', level: 'N4' },
          { kanji: '皿', hiragana: 'さら', meaning_es: 'Plato', level: 'N5' },
          { kanji: '箸', hiragana: 'はし', meaning_es: 'Palillos japoneses', level: 'N5' },
          { kanji: 'コップ', hiragana: 'こっぷ', meaning_es: 'Vaso de agua', level: 'N5' }
        ]
      },
      {
        id: 'u4-l6-ropa-prendas',
        number: 6,
        title: 'Ropa y prendas de vestir',
        japanese_title: '衣服・着るもの',
        description: 'Prendas superiores, pantalones, vestidos y abrigos',
        words: [
          { kanji: '服', hiragana: 'ふく', meaning_es: 'Ropa / Prenda', level: 'N5' },
          { kanji: 'シャツ', hiragana: 'しゃつ', meaning_es: 'Camisa', level: 'N5' },
          { kanji: 'ズボン', hiragana: 'ずぼん', meaning_es: 'Pantalones', level: 'N5' },
          { kanji: 'スカート', hiragana: 'すかーと', meaning_es: 'Falda', level: 'N5' },
          { kanji: 'コート', hiragana: 'こーと', meaning_es: 'Abrigo', level: 'N5' },
          { kanji: 'セーター', hiragana: 'せーたー', meaning_es: 'Suéter / Jersey', level: 'N5' },
          { kanji: '下着', hiragana: 'したぎ', meaning_es: 'Ropa interior', level: 'N4' },
          { kanji: '着物', hiragana: 'きもの', meaning_es: 'Kimono tradicional', level: 'N4' },
          { kanji: 'スーツ', hiragana: 'すーつ', meaning_es: 'Traje formal de chaqueta', level: 'N4' },
          { kanji: 'パジャマ', hiragana: 'ぱじゃま', meaning_es: 'Pijama', level: 'N5' }
        ]
      },
      {
        id: 'u4-l7-calzado-accesorios',
        number: 7,
        title: 'Calzado y accesorios personales',
        japanese_title: '靴・小物・持ち物',
        description: 'Zapatos, sombreros, gafas, cartera y paraguas',
        words: [
          { kanji: '靴', hiragana: 'くつ', meaning_es: 'Zapatos / Calzado', level: 'N5' },
          { kanji: '靴下', hiragana: 'くつした', meaning_es: 'Calcetines', level: 'N5' },
          { kanji: '帽子', hiragana: 'ぼうし', meaning_es: 'Sombrero / Gorra', level: 'N5' },
          { kanji: '眼鏡', hiragana: 'めがね', meaning_es: 'Gafas / Lentes', level: 'N5' },
          { kanji: '傘', hiragana: 'かさ', meaning_es: 'Paraguas', level: 'N5' },
          { kanji: '財布', hiragana: 'さいふ', meaning_es: 'Cartera / Billetera', level: 'N5' },
          { kanji: '鞄', hiragana: 'かばん', meaning_es: 'Bolso / Mochila', level: 'N5' },
          { kanji: 'ベルト', hiragana: 'べると', meaning_es: 'Cinturón', level: 'N5' },
          { kanji: '指輪', hiragana: 'ゆびわ', meaning_es: 'Anillo', level: 'N4' },
          { kanji: 'マスク', hiragana: 'ますく', meaning_es: 'Mascarilla', level: 'N5' }
        ]
      },
      {
        id: 'u4-l8-rutina-diaria',
        number: 8,
        title: 'Acciones de la rutina diaria',
        japanese_title: '日課・朝晩の行動',
        description: 'Despertar, asearse, vestirse, salir y descansar',
        words: [
          { kanji: '起きる', hiragana: 'おきる', meaning_es: 'Levantarse / Despertar', level: 'N5' },
          { kanji: '寝る', hiragana: 'ねる', meaning_es: 'Dormir / Ir a la cama', level: 'N5' },
          { kanji: '洗う', hiragana: 'あらう', meaning_es: 'Lavar', level: 'N5' },
          { kanji: '磨く', hiragana: 'みがく', meaning_es: 'Cepillar / Pulir', level: 'N5' },
          { kanji: '入る', hiragana: 'はいる', meaning_es: 'Entrar / Bañarse (bañera)', level: 'N5' },
          { kanji: '着る', hiragana: 'きる', meaning_es: 'Ponerse ropa superior', level: 'N5' },
          { kanji: '履く', hiragana: 'はく', meaning_es: 'Ponerse pantalones o calzado', level: 'N5' },
          { kanji: '脱ぐ', hiragana: 'ぬぐ', meaning_es: 'Quitarse la ropa o zapatos', level: 'N5' },
          { kanji: '出かける', hiragana: 'でかける', meaning_es: 'Salir de casa', level: 'N5' },
          { kanji: '休む', hiragana: 'やすむ', meaning_es: 'Descansar / Tomar un descanso', level: 'N5' }
        ]
      },
      {
        id: 'u4-l9-limpieza-tareas',
        number: 9,
        title: 'Limpieza y tareas domésticas',
        japanese_title: '家事・掃除・整頓',
        description: 'Barrer, lavar ropa, ordenar y gestionar residuos',
        words: [
          { kanji: '掃除', hiragana: 'そうじ', meaning_es: 'Limpieza (de una habitación)', level: 'N5' },
          { kanji: '洗濯', hiragana: 'せんたく', meaning_es: 'Lavado de ropa / Colada', level: 'N5' },
          { kanji: '料理', hiragana: 'りょうり', meaning_es: 'Cocinar / Comida elaborada', level: 'N5' },
          { kanji: '片付ける', hiragana: 'かたづける', meaning_es: 'Ordenar / Recoger', level: 'N4' },
          { kanji: '捨てる', hiragana: 'すてる', meaning_es: 'Tirar a la basura / Desechar', level: 'N4' },
          { kanji: '手伝う', hiragana: 'てつだう', meaning_es: 'Ayudar en tareas', level: 'N5' },
          { kanji: '買い物', hiragana: 'かいもの', meaning_es: 'Compras / Hacer la compra', level: 'N5' },
          { kanji: 'ゴミ', hiragana: 'ごみ', meaning_es: 'Basura / Desechos', level: 'N5' },
          { kanji: '綺麗', hiragana: 'きれい', meaning_es: 'Limpio / Ordenado / Hermoso', level: 'N5' },
          { kanji: '汚い', hiragana: 'きたない', meaning_es: 'Sucio / Desordenado', level: 'N5' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // UNIDAD 5: Comida, Bebida y Gastronomía Japonesa
  // -------------------------------------------------------------
  {
    id: 'unit-5-comida-gastronomia',
    title: 'Unidad 5: Comida, Bebida y Gastronomía Japonesa',
    japanese_title: '飲食・日本料理・味覚',
    subtitle: 'Alimentos básicos, carnes, pescados, verduras, frutas, platos típicos y pedidos',
    kanji_icon: '食',
    color: '#10b981',
    bg_gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u5-l1-alimentos-esenciales',
        number: 1,
        title: 'Alimentos esenciales y cereales',
        japanese_title: '主食・基本食材',
        description: 'Arroz, pan, fideos, huevos y condimentos primordiales',
        words: [
          { kanji: '水', hiragana: 'みず', meaning_es: 'Agua pura', level: 'N5' },
          { kanji: 'ご飯', hiragana: 'ごはん', meaning_es: 'Arroz cocido / Comida', level: 'N5' },
          { kanji: 'パン', hiragana: 'ぱん', meaning_es: 'Pan', level: 'N5' },
          { kanji: '麺', hiragana: 'めん', meaning_es: 'Fideos', level: 'N4' },
          { kanji: '米', hiragana: 'こめ', meaning_es: 'Grano de arroz crudo', level: 'N4' },
          { kanji: '卵', hiragana: 'たまご', meaning_es: 'Huevo', level: 'N5' },
          { kanji: '豆腐', hiragana: 'とうふ', meaning_es: 'Tofu (cuajada de soja)', level: 'N4' },
          { kanji: '小麦粉', hiragana: 'こむぎこ', meaning_es: 'Harina de trigo', level: 'N4' },
          { kanji: '油', hiragana: 'あぶら', meaning_es: 'Aceite de cocina', level: 'N4' },
          { kanji: '塩', hiragana: 'しお', meaning_es: 'Sal', level: 'N5' }
        ]
      },
      {
        id: 'u5-l2-carnes-aves',
        number: 2,
        title: 'Carnes, aves y preparados',
        japanese_title: '肉類・鶏肉・牛肉',
        description: 'Tipos de carne y cortes más consumidos',
        words: [
          { kanji: '肉', hiragana: 'にく', meaning_es: 'Carne', level: 'N5' },
          { kanji: '牛肉', hiragana: 'ぎゅうにく', meaning_es: 'Carne de ternera / buey', level: 'N5' },
          { kanji: '豚肉', hiragana: 'ぶたにく', meaning_es: 'Carne de cerdo', level: 'N5' },
          { kanji: '鶏肉', hiragana: 'とりにく', meaning_es: 'Carne de pollo', level: 'N5' },
          { kanji: 'ひき肉', hiragana: 'ひきにく', meaning_es: 'Carne picada / molida', level: 'N4' },
          { kanji: 'ハム', hiragana: 'はむ', meaning_es: 'Jamón cocido', level: 'N5' },
          { kanji: 'ソーセージ', hiragana: 'そーせーじ', meaning_es: 'Salchicha', level: 'N5' },
          { kanji: '焼き肉', hiragana: 'やきにく', meaning_es: 'Carne asada a la parrilla', level: 'N5' },
          { kanji: 'から揚げ', hiragana: 'からあげ', meaning_es: 'Pollo frito crujiente', level: 'N5' },
          { kanji: '焼き鳥', hiragana: 'やきとり', meaning_es: 'Brochetas de pollo asado', level: 'N5' }
        ]
      },
      {
        id: 'u5-l3-pescados-mariscos',
        number: 3,
        title: 'Pescados y mariscos',
        japanese_title: '魚介類・刺身',
        description: 'Variedades marinas para sushi, sashimi y cocción',
        words: [
          { kanji: '魚', hiragana: 'さかな', meaning_es: 'Pescado', level: 'N5' },
          { kanji: '刺身', hiragana: 'さしみ', meaning_es: 'Sashimi (pescado crudo laminado)', level: 'N5' },
          { kanji: '鮭', hiragana: 'さけ', meaning_es: 'Salmón', level: 'N4' },
          { kanji: '鮪', hiragana: 'まぐろ', meaning_es: 'Atún', level: 'N4' },
          { kanji: '鯛', hiragana: 'たい', meaning_es: 'Besugo / Pargo', level: 'N4' },
          { kanji: '海老', hiragana: 'えび', meaning_es: 'Gamba / Camarón', level: 'N4' },
          { kanji: '蛸', hiragana: 'たこ', meaning_es: 'Pulpo', level: 'N4' },
          { kanji: '烏賊', hiragana: 'いか', meaning_es: 'Calamar', level: 'N4' },
          { kanji: '貝', hiragana: 'かい', meaning_es: 'Molusco / Almeja', level: 'N4' },
          { kanji: '海苔', hiragana: 'のり', meaning_es: 'Alga nori seca', level: 'N5' }
        ]
      },
      {
        id: 'u5-l4-verduras-hortalizas',
        number: 4,
        title: 'Verduras y hortalizas',
        japanese_title: '野菜類・根菜',
        description: 'Vegetales indispensables en la cocina oriental',
        words: [
          { kanji: '野菜', hiragana: 'やさい', meaning_es: 'Verduras / Hortalizas', level: 'N5' },
          { kanji: '人参', hiragana: 'にんじん', meaning_es: 'Zanahoria', level: 'N5' },
          { kanji: '玉ねぎ', hiragana: 'たまねぎ', meaning_es: 'Cebolla', level: 'N5' },
          { kanji: 'キャベツ', hiragana: 'きゃべつ', meaning_es: 'Repollo / Col', level: 'N5' },
          { kanji: 'トマト', hiragana: 'とまと', meaning_es: 'Tomate', level: 'N5' },
          { kanji: '大根', hiragana: 'だいこん', meaning_es: 'Rábano gigante japonés (daikon)', level: 'N4' },
          { kanji: 'じゃがいも', hiragana: 'じゃがいも', meaning_es: 'Patata / Papa', level: 'N5' },
          { kanji: 'きゅうり', hiragana: 'きゅうり', meaning_es: 'Pepino', level: 'N5' },
          { kanji: '茄子', hiragana: 'なす', meaning_es: 'Berenjena', level: 'N4' },
          { kanji: 'ほうれん草', hiragana: 'ほうれんそう', meaning_es: 'Espinaca', level: 'N4' }
        ]
      },
      {
        id: 'u5-l5-frutas-frescas',
        number: 5,
        title: 'Frutas frescas',
        japanese_title: '果物・フルーツ',
        description: 'Frutas de temporada dulces y jugosas',
        words: [
          { kanji: '果物', hiragana: 'くだもの', meaning_es: 'Fruta', level: 'N5' },
          { kanji: 'りんご', hiragana: 'りんご', meaning_es: 'Manzana', level: 'N5' },
          { kanji: 'みかん', hiragana: 'みかん', meaning_es: 'Mandarina japonesa', level: 'N5' },
          { kanji: 'バナナ', hiragana: 'ばなな', meaning_es: 'Plátano / Banana', level: 'N5' },
          { kanji: '葡萄', hiragana: 'ぶどう', meaning_es: 'Uvas', level: 'N4' },
          { kanji: '苺', hiragana: 'いちご', meaning_es: 'Fresa', level: 'N5' },
          { kanji: '西瓜', hiragana: 'すいか', meaning_es: 'Sandía', level: 'N4' },
          { kanji: '桃', hiragana: 'もも', meaning_es: 'Melocotón / Durazno', level: 'N4' },
          { kanji: '梨', hiragana: 'なし', meaning_es: 'Pera asiática', level: 'N4' },
          { kanji: 'レモン', hiragana: 'れもん', meaning_es: 'Limón', level: 'N5' }
        ]
      },
      {
        id: 'u5-l6-bebidas-frias-calientes',
        number: 6,
        title: 'Bebidas frías y calientes',
        japanese_title: '飲み物・お茶・酒類',
        description: 'Té verde, café, zumos y refrescos',
        words: [
          { kanji: 'お茶', hiragana: 'おちゃ', meaning_es: 'Té verde / Té', level: 'N5' },
          { kanji: '緑茶', hiragana: 'りょくちゃ', meaning_es: 'Té verde japonés', level: 'N4' },
          { kanji: '紅茶', hiragana: 'こうちゃ', meaning_es: 'Té negro', level: 'N5' },
          { kanji: 'コーヒー', hiragana: 'こーひー', meaning_es: 'Café', level: 'N5' },
          { kanji: '牛乳', hiragana: 'ぎゅうにゅう', meaning_es: 'Leche de vaca', level: 'N5' },
          { kanji: 'ジュース', hiragana: 'じゅーす', meaning_es: 'Zumo / Jugo de frutas', level: 'N5' },
          { kanji: 'ビール', hiragana: 'びーる', meaning_es: 'Cerveza', level: 'N5' },
          { kanji: 'お酒', hiragana: 'おさけ', meaning_es: 'Sake japonés / Bebida alcohólica', level: 'N5' },
          { kanji: '氷水', hiragana: 'こおりみず', meaning_es: 'Agua con hielo', level: 'N5' },
          { kanji: '炭酸水', hiragana: 'たんさんすい', meaning_es: 'Agua con gas', level: 'N4' }
        ]
      },
      {
        id: 'u5-l7-platos-populares',
        number: 7,
        title: 'Platos tradicionales y populares',
        japanese_title: '日本料理・名物',
        description: 'Sushi, ramen, tempura, soba, udon y curry japonés',
        words: [
          { kanji: '寿司', hiragana: 'すし', meaning_es: 'Sushi', level: 'N5' },
          { kanji: 'ラーメン', hiragana: 'らーめん', meaning_es: 'Ramen', level: 'N5' },
          { kanji: 'うどん', hiragana: 'うどん', meaning_es: 'Fideos udon gruesos', level: 'N5' },
          { kanji: 'そば', hiragana: 'そば', meaning_es: 'Fideos soba de alforfón', level: 'N5' },
          { kanji: '天ぷら', hiragana: 'てんぷら', meaning_es: 'Tempura de verduras o mariscos', level: 'N5' },
          { kanji: 'カレー', hiragana: 'かれー', meaning_es: 'Curry japonés con arroz', level: 'N5' },
          { kanji: '牛丼', hiragana: 'ぎゅうどん', meaning_es: 'Bol de arroz con ternera (gyudon)', level: 'N5' },
          { kanji: '弁当', hiragana: 'べんとう', meaning_es: 'Bento / Fiambrera de comida', level: 'N5' },
          { kanji: '味噌汁', hiragana: 'みそしる', meaning_es: 'Sopa de miso', level: 'N5' },
          { kanji: 'おにぎり', hiragana: 'おにぎり', meaning_es: 'Bola de arroz rellena (onigiri)', level: 'N5' }
        ]
      },
      {
        id: 'u5-l8-sabores-adjetivos',
        number: 8,
        title: 'Sabores y adjetivos culinarios',
        japanese_title: '味覚・料理の形容詞',
        description: 'Dulce, picante, salado, ácido, amargo y temperatura',
        words: [
          { kanji: '美味しい', hiragana: 'おいしい', meaning_es: 'Delicioso / Rico', level: 'N5' },
          { kanji: 'まずい', hiragana: 'まずい', meaning_es: 'Malo de sabor / Desagradable', level: 'N5' },
          { kanji: '甘い', hiragana: 'あまい', meaning_es: 'Dulce', level: 'N5' },
          { kanji: '辛い', hiragana: 'からい', meaning_es: 'Picante / Muy especiado', level: 'N5' },
          { kanji: '塩辛い', hiragana: 'しおからい', meaning_es: 'Salado', level: 'N4' },
          { kanji: '酸っぱい', hiragana: 'すっぱい', meaning_es: 'Ácido / Agrio', level: 'N4' },
          { kanji: '苦い', hiragana: 'にがい', meaning_es: 'Amargo', level: 'N4' },
          { kanji: '熱い', hiragana: 'あつい', meaning_es: 'Muy caliente (comida o bebida)', level: 'N5' },
          { kanji: '冷たい', hiragana: 'つめたい', meaning_es: 'Frío al tacto / Helado', level: 'N5' },
          { kanji: '濃い', hiragana: 'こい', meaning_es: 'Sabor concentrado / Fuerte', level: 'N4' }
        ]
      },
      {
        id: 'u5-l9-restaurante-pedidos',
        number: 9,
        title: 'En el restaurante: pedidos y modales',
        japanese_title: '外食・注文・お会計',
        description: 'Frases y términos para comer fuera y pagar la cuenta',
        words: [
          { kanji: 'レストラン', hiragana: 'れすとらん', meaning_es: 'Restaurante', level: 'N5' },
          { kanji: 'メニュー', hiragana: 'めにゅー', meaning_es: 'Menú / Carta de platos', level: 'N5' },
          { kanji: '注文', hiragana: 'ちゅうもん', meaning_es: 'Pedido / Ordenar comida', level: 'N4' },
          { kanji: '会計', hiragana: 'かいけい', meaning_es: 'Cuenta / Pagar en caja', level: 'N4' },
          { kanji: '食べる', hiragana: 'たべる', meaning_es: 'Comer', level: 'N5' },
          { kanji: '飲む', hiragana: 'のむ', meaning_es: 'Beber / Tomar', level: 'N5' },
          { kanji: 'いただきます', hiragana: 'いただきます', meaning_es: 'Buen provecho / Agradezco la comida', level: 'N5' },
          { kanji: 'ごちそうさま', hiragana: 'ごちそうさま', meaning_es: 'Gracias por la comida (al terminar)', level: 'N5' },
          { kanji: '乾杯', hiragana: 'かんぱい', meaning_es: '¡Salud! (brindis)', level: 'N4' },
          { kanji: 'おすすめ', hiragana: 'おすすめ', meaning_es: 'Recomendación del chef / Sugerencia', level: 'N4' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // UNIDAD 6: La Ciudad, el Transporte y las Compras
  // -------------------------------------------------------------
  {
    id: 'unit-6-ciudad-transporte',
    title: 'Unidad 6: La Ciudad, el Transporte y las Compras',
    japanese_title: '街・交通・買い物・道案内',
    subtitle: 'Transporte público, estaciones, edificios, tiendas, direcciones y compras',
    kanji_icon: '街',
    color: '#06b6d4',
    bg_gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u6-l1-medios-transporte',
        number: 1,
        title: 'Medios de transporte',
        japanese_title: '乗り物・交通機関',
        description: 'Tren, metro, autobús, taxi, avión y bicicleta',
        words: [
          { kanji: '電車', hiragana: 'でんしゃ', meaning_es: 'Tren eléctrico', level: 'N5' },
          { kanji: '地下鉄', hiragana: 'ちかてつ', meaning_es: 'Metro subterráneo', level: 'N5' },
          { kanji: 'バス', hiragana: 'ばす', meaning_es: 'Autobús', level: 'N5' },
          { kanji: 'タクシー', hiragana: 'たくしー', meaning_es: 'Taxi', level: 'N5' },
          { kanji: '飛行機', hiragana: 'ひこうき', meaning_es: 'Avión', level: 'N5' },
          { kanji: '新幹線', hiragana: 'しんかんせん', meaning_es: 'Tren bala Shinkansen', level: 'N5' },
          { kanji: '車', hiragana: 'くるま', meaning_es: 'Coche / Automóvil', level: 'N5' },
          { kanji: '自転車', hiragana: 'じてんしゃ', meaning_es: 'Bicicleta', level: 'N5' },
          { kanji: '船', hiragana: 'ふね', meaning_es: 'Barco / Embarcación', level: 'N5' },
          { kanji: 'バイク', hiragana: 'ばいく', meaning_es: 'Moto / Motocicleta', level: 'N5' }
        ]
      },
      {
        id: 'u6-l2-estacion-viajes',
        number: 2,
        title: 'La estación de tren y el aeropuerto',
        japanese_title: '駅・空港・切符',
        description: 'Andenes, billetes, torniquetes y salidas de viaje',
        words: [
          { kanji: '駅', hiragana: 'えき', meaning_es: 'Estación de tren', level: 'N5' },
          { kanji: '切符', hiragana: 'きっぷ', meaning_es: 'Billete / Boleto de viaje', level: 'N5' },
          { kanji: '改札', hiragana: 'かいさつ', meaning_es: 'Torniquete de control de billetes', level: 'N4' },
          { kanji: 'ホーム', hiragana: 'ほーむ', meaning_es: 'Andén de la estación', level: 'N5' },
          { kanji: '乗り場', hiragana: 'のりば', meaning_es: 'Parada / Andén de embarque', level: 'N4' },
          { kanji: '空港', hiragana: 'くうこう', meaning_es: 'Aeropuerto', level: 'N5' },
          { kanji: '港', hiragana: 'みなと', meaning_es: 'Puerto marítimo', level: 'N4' },
          { kanji: '旅行', hiragana: 'りょこう', meaning_es: 'Viaje / Turismo', level: 'N5' },
          { kanji: '出発', hiragana: 'しゅっぱつ', meaning_es: 'Salida / Partida de tren o vuelo', level: 'N4' },
          { kanji: '到着', hiragana: 'とうちゃく', meaning_es: 'Llegada a destino', level: 'N4' }
        ]
      },
      {
        id: 'u6-l3-edificios-publicos',
        number: 3,
        title: 'Edificios y lugares públicos',
        japanese_title: '公共施設・街の建物',
        description: 'Bancos, oficinas postales, bibliotecas y parques',
        words: [
          { kanji: '学校', hiragana: 'がっこう', meaning_es: 'Escuela / Colegio', level: 'N5' },
          { kanji: '会社', hiragana: 'かいしゃ', meaning_es: 'Empresa / Compañía', level: 'N5' },
          { kanji: '銀行', hiragana: 'ぎんこう', meaning_es: 'Banco financiero', level: 'N5' },
          { kanji: '郵便局', hiragana: 'ゆうびんきょく', meaning_es: 'Oficina de correos', level: 'N5' },
          { kanji: '図書館', hiragana: 'としょかん', meaning_es: 'Biblioteca pública', level: 'N5' },
          { kanji: '公園', hiragana: 'こうえん', meaning_es: 'Parque público', level: 'N5' },
          { kanji: '交番', hiragana: 'こうばん', meaning_es: 'Caseta policial de barrio (Koban)', level: 'N5' },
          { kanji: '市役所', hiragana: 'しやくしょ', meaning_es: 'Ayuntamiento / Alcaldía', level: 'N4' },
          { kanji: '博物館', hiragana: 'はくぶつかん', meaning_es: 'Museo', level: 'N4' },
          { kanji: '美術館', hiragana: 'びじゅつかん', meaning_es: 'Museo de arte', level: 'N4' }
        ]
      },
      {
        id: 'u6-l4-tiendas-comercio',
        number: 4,
        title: 'Establecimientos y tiendas comerciales',
        japanese_title: '店舗・商店・売り場',
        description: 'Supermercados, konbinis, librerías y farmacias',
        words: [
          { kanji: '店', hiragana: 'みせ', meaning_es: 'Tienda / Local comercial', level: 'N5' },
          { kanji: 'スーパー', hiragana: 'すーぱー', meaning_es: 'Supermercado', level: 'N5' },
          { kanji: 'コンビニ', hiragana: 'こんびに', meaning_es: 'Tienda de conveniencia 24h', level: 'N5' },
          { kanji: 'デパート', hiragana: 'でぱーと', meaning_es: 'Grandes almacenes', level: 'N5' },
          { kanji: '本屋', hiragana: 'ほんや', meaning_es: 'Librería', level: 'N5' },
          { kanji: '薬局', hiragana: 'やっきょく', meaning_es: 'Farmacia', level: 'N4' },
          { kanji: 'パン屋', hiragana: 'ぱんや', meaning_es: 'Panadería', level: 'N5' },
          { kanji: '花屋', hiragana: 'はなや', meaning_es: 'Floristería', level: 'N5' },
          { kanji: '喫茶店', hiragana: 'きっさてん', meaning_es: 'Cafetería tradicional', level: 'N5' },
          { kanji: '居酒屋', hiragana: 'いざかや', meaning_es: 'Bar / Taberna japonesa Izakaya', level: 'N4' }
        ]
      },
      {
        id: 'u6-l5-posicion-espacial',
        number: 5,
        title: 'Posición espacial y referencias',
        japanese_title: '位置関係・前後左右',
        description: 'Arriba, abajo, delante, detrás, dentro y fuera',
        words: [
          { kanji: '上', hiragana: 'うえ', meaning_es: 'Arriba / Encima', level: 'N5' },
          { kanji: '下', hiragana: 'した', meaning_es: 'Abajo / Debajo', level: 'N5' },
          { kanji: '前', hiragana: 'まえ', meaning_es: 'Delante / Frente', level: 'N5' },
          { kanji: '後ろ', hiragana: 'うしろ', meaning_es: 'Detrás / Espaldas', level: 'N5' },
          { kanji: '右', hiragana: 'みぎ', meaning_es: 'Derecha', level: 'N5' },
          { kanji: '左', hiragana: 'ひだり', meaning_es: 'Izquierda', level: 'N5' },
          { kanji: '中', hiragana: 'なか', meaning_es: 'Dentro / En medio', level: 'N5' },
          { kanji: '外', hiragana: 'そと', meaning_es: 'Fuera / Exterior', level: 'N5' },
          { kanji: '隣', hiragana: 'となり', meaning_es: 'Al lado / Vecino', level: 'N5' },
          { kanji: '近く', hiragana: 'ちかく', meaning_es: 'Cerca / Cercanías', level: 'N5' }
        ]
      },
      {
        id: 'u6-l6-orientacion-direcciones',
        number: 6,
        title: 'Orientación urbana y puntos cardinales',
        japanese_title: '方角・道案内・交差点',
        description: 'Norte, sur, este, oeste, cruces y giros de dirección',
        words: [
          { kanji: '北', hiragana: 'きた', meaning_es: 'Norte', level: 'N5' },
          { kanji: '南', hiragana: 'みなみ', meaning_es: 'Sur', level: 'N5' },
          { kanji: '東', hiragana: 'ひがし', meaning_es: 'Este / Oriente', level: 'N5' },
          { kanji: '西', hiragana: 'にし', meaning_es: 'Oeste / Poniente', level: 'N5' },
          { kanji: 'まっすぐ', hiragana: 'まっすぐ', meaning_es: 'Todo recto / Derecho', level: 'N5' },
          { kanji: '曲がる', hiragana: 'まがる', meaning_es: 'Girar / Doblar la esquina', level: 'N5' },
          { kanji: '渡る', hiragana: 'わたる', meaning_es: 'Cruzar la calle o un puente', level: 'N5' },
          { kanji: '遠い', hiragana: 'とおい', meaning_es: 'Lejos / Distante', level: 'N5' },
          { kanji: '道', hiragana: 'みち', meaning_es: 'Calle / Camino', level: 'N5' },
          { kanji: '交差点', hiragana: 'こうさてん', meaning_es: 'Cruce de calles / Intersección', level: 'N4' }
        ]
      },
      {
        id: 'u6-l7-verbos-movimiento',
        number: 7,
        title: 'Verbos de movimiento y desplazamiento',
        japanese_title: '移動動詞・歩行・乗車',
        description: 'Ir, venir, volver, caminar, correr, subir y bajar de vehículos',
        words: [
          { kanji: '行く', hiragana: 'いく', meaning_es: 'Ir a algún lugar', level: 'N5' },
          { kanji: '来る', hiragana: 'くる', meaning_es: 'Venir aquí', level: 'N5' },
          { kanji: '帰る', hiragana: 'かえる', meaning_es: 'Volver / Regresar a casa', level: 'N5' },
          { kanji: '歩く', hiragana: 'あるく', meaning_es: 'Caminar a pie', level: 'N5' },
          { kanji: '走る', hiragana: 'はしる', meaning_es: 'Correr', level: 'N5' },
          { kanji: '乗る', hiragana: 'のる', meaning_es: 'Subir a un vehículo', level: 'N5' },
          { kanji: '降りる', hiragana: 'おりる', meaning_es: 'Bajar de un vehículo', level: 'N5' },
          { kanji: '止まる', hiragana: 'とまる', meaning_es: 'Detenerse / Parar', level: 'N5' },
          { kanji: '急ぐ', hiragana: 'いそぐ', meaning_es: 'Apresurarse / Darse prisa', level: 'N5' },
          { kanji: '通る', hiragana: 'とおる', meaning_es: 'Pasar por / Atravesar', level: 'N4' }
        ]
      },
      {
        id: 'u6-l8-dinero-compras',
        number: 8,
        title: 'Dinero, precios y transacciones',
        japanese_title: 'お金・価格・お支払い',
        description: 'Comprar, vender, precios altos y bajos, efectivo y recibos',
        words: [
          { kanji: 'お金', hiragana: 'おかね', meaning_es: 'Dinero', level: 'N5' },
          { kanji: '円', hiragana: 'えん', meaning_es: 'Yen', level: 'N5' },
          { kanji: '値段', hiragana: 'ねだん', meaning_es: 'Precio', level: 'N5' },
          { kanji: '高い', hiragana: 'たかい', meaning_es: 'Caro / De precio elevado', level: 'N5' },
          { kanji: '安い', hiragana: 'やすい', meaning_es: 'Barato / Económico', level: 'N5' },
          { kanji: '買う', hiragana: 'かう', meaning_es: 'Comprar', level: 'N5' },
          { kanji: '売る', hiragana: 'うる', meaning_es: 'Vender', level: 'N5' },
          { kanji: '現金', hiragana: 'げんきん', meaning_es: 'Dinero en efectivo', level: 'N4' },
          { kanji: 'カード', hiragana: 'かーど', meaning_es: 'Tarjeta bancaria de crédito/débito', level: 'N5' },
          { kanji: 'レシート', hiragana: 'れしーと', meaning_es: 'Ticket de compra / Recibo', level: 'N5' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // UNIDAD 7: Trabajo, Profesiones, Escuela y Sociedad
  // -------------------------------------------------------------
  {
    id: 'unit-7-trabajo-educacion',
    title: 'Unidad 7: Trabajo, Profesiones, Escuela y Sociedad',
    japanese_title: '仕事・学校・会社・社会制度',
    subtitle: 'Oficios, ambiente académico, oficina, correspondencia y deberes cívicos',
    kanji_icon: '学',
    color: '#6366f1',
    bg_gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u7-l1-profesiones-oficios',
        number: 1,
        title: 'Profesiones y oficios comunes',
        japanese_title: '職業・仕事の種類',
        description: 'Médicos, profesores, policías, cocineros y empleados',
        words: [
          { kanji: '先生', hiragana: 'せんせい', meaning_es: 'Profesor / Maestro / Doctor', level: 'N5' },
          { kanji: '学生', hiragana: 'がくせい', meaning_es: 'Estudiante', level: 'N5' },
          { kanji: '会社員', hiragana: 'かいしゃいん', meaning_es: 'Empleado de empresa', level: 'N5' },
          { kanji: '医者', hiragana: 'いしゃ', meaning_es: 'Médico', level: 'N5' },
          { kanji: '警察官', hiragana: 'けいさつかん', meaning_es: 'Oficial de policía', level: 'N4' },
          { kanji: '料理人', hiragana: 'りょうりにん', meaning_es: 'Cocinero / Chef', level: 'N4' },
          { kanji: '弁護士', hiragana: 'べんごし', meaning_es: 'Abogado', level: 'N3' },
          { kanji: '運転手', hiragana: 'うんてんしゅ', meaning_es: 'Conductor / Chófer', level: 'N4' },
          { kanji: '店員', hiragana: 'てんいん', meaning_es: 'Dependiente / Empleado de tienda', level: 'N5' },
          { kanji: '歌手', hiragana: 'かしゅ', meaning_es: 'Cantante profesional', level: 'N4' }
        ]
      },
      {
        id: 'u7-l2-escuela-aula',
        number: 2,
        title: 'En la escuela y el aula',
        japanese_title: '学校生活・授業・試験',
        description: 'Clases, deberes escolares, exámenes y descansos',
        words: [
          { kanji: '学校', hiragana: 'がっこう', meaning_es: 'Escuela', level: 'N5' },
          { kanji: '教室', hiragana: 'きょうしつ', meaning_es: 'Aula de clase', level: 'N5' },
          { kanji: '授業', hiragana: 'じゅぎょう', meaning_es: 'Clase / Lección escolar', level: 'N5' },
          { kanji: '宿題', hiragana: 'しゅくだい', meaning_es: 'Deberes / Tarea para casa', level: 'N5' },
          { kanji: '試験', hiragana: 'しけん', meaning_es: 'Examen / Prueba académica', level: 'N5' },
          { kanji: '休み時間', hiragana: 'やすみじかん', meaning_es: 'Hora del recreo / Descanso', level: 'N5' },
          { kanji: '質問', hiragana: 'しつもん', meaning_es: 'Pregunta / Duda', level: 'N5' },
          { kanji: '答え', hiragana: 'こたえ', meaning_es: 'Respuesta', level: 'N5' },
          { kanji: '席', hiragana: 'せき', meaning_es: 'Asiento / Pupitre', level: 'N4' },
          { kanji: '黒板', hiragana: 'こくばん', meaning_es: 'Pizarra del aula', level: 'N4' }
        ]
      },
      {
        id: 'u7-l3-material-escolar',
        number: 3,
        title: 'Material escolar y de estudio',
        japanese_title: '文房具・教材',
        description: 'Cuadernos, lápices, gomas, libros y reglas',
        words: [
          { kanji: '本', hiragana: 'ほん', meaning_es: 'Libro', level: 'N5' },
          { kanji: '教科書', hiragana: 'きょうかしょ', meaning_es: 'Libro de texto escolar', level: 'N4' },
          { kanji: 'ノート', hiragana: 'のーと', meaning_es: 'Cuaderno / Libreta', level: 'N5' },
          { kanji: '鉛筆', hiragana: 'えんぴつ', meaning_es: 'Lápiz de grafito', level: 'N5' },
          { kanji: 'ペン', hiragana: 'ぺん', meaning_es: 'Bolígrafo / Pluma', level: 'N5' },
          { kanji: '消しゴム', hiragana: 'けしごむ', meaning_es: 'Goma de borrar', level: 'N5' },
          { kanji: '辞書', hiragana: 'じしょ', meaning_es: 'Diccionario', level: 'N5' },
          { kanji: '定規', hiragana: 'じょうぎ', meaning_es: 'Regla de medir', level: 'N4' },
          { kanji: 'はさみ', hiragana: 'はさみ', meaning_es: 'Tijeras', level: 'N5' },
          { kanji: '鞄', hiragana: 'かばん', meaning_es: 'Cartera escolar / Mochila', level: 'N5' }
        ]
      },
      {
        id: 'u7-l4-oficina-corporativo',
        number: 4,
        title: 'La oficina y el ambiente laboral',
        japanese_title: 'オフィス・職場・ビジネス',
        description: 'Reuniones, tarjetas de visita, jefes y sueldos',
        words: [
          { kanji: '事務所', hiragana: 'じむしょ', meaning_es: 'Oficina / Despacho', level: 'N4' },
          { kanji: '会議', hiragana: 'かいぎ', meaning_es: 'Reunión de trabajo', level: 'N4' },
          { kanji: '名刺', hiragana: 'めいし', meaning_es: 'Tarjeta de visita profesional', level: 'N4' },
          { kanji: '書類', hiragana: 'しょるい', meaning_es: 'Documentos oficiales / Papeles', level: 'N4' },
          { kanji: 'パソコン', hiragana: 'ぱそこん', meaning_es: 'Ordenador / Computadora de oficina', level: 'N5' },
          { kanji: '社長', hiragana: 'しゃちょう', meaning_es: 'Presidente / Director de empresa', level: 'N5' },
          { kanji: '同僚', hiragana: 'どうりょう', meaning_es: 'Compañero de trabajo / Colega', level: 'N3' },
          { kanji: '残業', hiragana: 'ざんぎょう', meaning_es: 'Horas extras de trabajo', level: 'N4' },
          { kanji: '給料', hiragana: 'きゅうりょう', meaning_es: 'Salario / Sueldo', level: 'N4' },
          { kanji: '働く', hiragana: 'はたらく', meaning_es: 'Trabajar / Laborar', level: 'N5' }
        ]
      },
      {
        id: 'u7-l5-comunicacion-tramites',
        number: 5,
        title: 'Comunicación y citas profesionales',
        japanese_title: '連絡・相談・予約',
        description: 'Llamadas, correos, citas previas y consultas',
        words: [
          { kanji: '電話', hiragana: 'でんわ', meaning_es: 'Llamada telefónica', level: 'N5' },
          { kanji: 'メール', hiragana: 'めーる', meaning_es: 'Correo electrónico', level: 'N5' },
          { kanji: '話す', hiragana: 'はなす', meaning_es: 'Hablar / Conversar', level: 'N5' },
          { kanji: '聞く', hiragana: 'きく', meaning_es: 'Preguntar / Escuchar', level: 'N5' },
          { kanji: '相談', hiragana: 'そうだん', meaning_es: 'Consulta / Pedir consejo', level: 'N4' },
          { kanji: '連絡', hiragana: 'れんらく', meaning_es: 'Aviso / Ponerse en contacto', level: 'N4' },
          { kanji: '報告', hiragana: 'ほうこく', meaning_es: 'Informe / Reportar novedades', level: 'N4' },
          { kanji: '予約', hiragana: 'よやく', meaning_es: 'Reserva / Cita previa', level: 'N5' },
          { kanji: '約束', hiragana: 'やくそく', meaning_es: 'Promesa / Compromiso agendado', level: 'N5' },
          { kanji: '予定', hiragana: 'よてい', meaning_es: 'Plan / Horario programado', level: 'N5' }
        ]
      },
      {
        id: 'u7-l6-sociedad-instituciones',
        number: 6,
        title: 'Sociedad, instituciones y civismo',
        japanese_title: '社会制度・法律・市民',
        description: 'Normas de convivencia, leyes, paz y comunidad',
        words: [
          { kanji: '社会', hiragana: 'しゃかい', meaning_es: 'Sociedad', level: 'N4' },
          { kanji: '法律', hiragana: 'ほうりつ', meaning_es: 'Ley / Legislación', level: 'N4' },
          { kanji: '市民', hiragana: 'しみん', meaning_es: 'Ciudadano', level: 'N4' },
          { kanji: '国', hiragana: 'くに', meaning_es: 'País / Nación', level: 'N5' },
          { kanji: '世界', hiragana: 'せかい', meaning_es: 'El mundo', level: 'N5' },
          { kanji: '平和', hiragana: 'へいわ', meaning_es: 'Paz', level: 'N4' },
          { kanji: '規則', hiragana: 'きそく', meaning_es: 'Regla / Reglamento', level: 'N4' },
          { kanji: '税金', hiragana: 'ぜいきん', meaning_es: 'Impuestos', level: 'N3' },
          { kanji: '投票', hiragana: 'とうひょう', meaning_es: 'Voto en elecciones', level: 'N3' },
          { kanji: '文化', hiragana: 'ぶんか', meaning_es: 'Cultura', level: 'N5' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // UNIDAD 8: Emociones, Personalidad, Ocio y Cultura
  // -------------------------------------------------------------
  {
    id: 'unit-8-emociones-cultura',
    title: 'Unidad 8: Emociones, Personalidad, Ocio y Cultura',
    japanese_title: '感情・性格・趣味・日本文化',
    subtitle: 'Sentimientos, temperamento, música, deportes, aficiones y tradiciones',
    kanji_icon: '心',
    color: '#ec4899',
    bg_gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u8-l1-emociones-positivas',
        number: 1,
        title: 'Sentimientos y emociones positivas',
        japanese_title: '喜び・幸福・安心',
        description: 'Alegría, gratitud, calma y satisfacción',
        words: [
          { kanji: '嬉しい', hiragana: 'うれしい', meaning_es: 'Contento / Feliz por un suceso', level: 'N5' },
          { kanji: '楽しい', hiragana: 'たのしい', meaning_es: 'Divertido / Amenudo agradable', level: 'N5' },
          { kanji: '好き', hiragana: 'すき', meaning_es: 'Gustar / Preferir', level: 'N5' },
          { kanji: '大好き', hiragana: 'だいすき', meaning_es: 'Encantar / Fascinar', level: 'N5' },
          { kanji: '愛', hiragana: 'あい', meaning_es: 'Amor', level: 'N4' },
          { kanji: '感謝', hiragana: 'かんしゃ', meaning_es: 'Gratitud / Agradecimiento', level: 'N4' },
          { kanji: '笑顔', hiragana: 'えがお', meaning_es: 'Rostro sonriente / Sonrisa', level: 'N4' },
          { kanji: '幸せ', hiragana: 'しあわせ', meaning_es: 'Felicidad plena', level: 'N4' },
          { kanji: '安心', hiragana: 'あんしん', meaning_es: 'Alivio / Tranquilidad de ánimo', level: 'N4' },
          { kanji: '喜ぶ', hiragana: 'よろこぶ', meaning_es: 'Alegrarse / Celebrar con júbilo', level: 'N4' }
        ]
      },
      {
        id: 'u8-l2-emociones-dificiles',
        number: 2,
        title: 'Emociones difíciles y preocupación',
        japanese_title: '悲しみ・怒り・不安',
        description: 'Tristeza, soledad, ira, enfado y apuros',
        words: [
          { kanji: '悲しい', hiragana: 'かなしい', meaning_es: 'Triste', level: 'N5' },
          { kanji: '寂しい', hiragana: 'さびしい', meaning_es: 'Solitario / Echar de menos', level: 'N5' },
          { kanji: '怒る', hiragana: 'おこる', meaning_es: 'Enfadarse / Enojarse', level: 'N4' },
          { kanji: '驚く', hiragana: 'おどろく', meaning_es: 'Sorprenderse / Asombrarse', level: 'N4' },
          { kanji: '困る', hiragana: 'こまる', meaning_es: 'Estar en problemas / En apuros', level: 'N5' },
          { kanji: '心配', hiragana: 'しんぱい', meaning_es: 'Preocupación / Inquietud', level: 'N5' },
          { kanji: '恥ずかしい', hiragana: 'はずかしい', meaning_es: 'Avergonzado / Tímido', level: 'N4' },
          { kanji: '退屈', hiragana: 'たいくつ', meaning_es: 'Aburrido / Tedioso', level: 'N4' },
          { kanji: '怖がる', hiragana: 'こわがる', meaning_es: 'Tener miedo / Temer', level: 'N4' },
          { kanji: '泣く', hiragana: 'なく', meaning_es: 'Llorar', level: 'N5' }
        ]
      },
      {
        id: 'u8-l3-personalidad-caracter',
        number: 3,
        title: 'Rasgos de personalidad y carácter',
        japanese_title: '性格・美徳・人柄',
        description: 'Amabilidad, rigor, simpatía, timidez y sinceridad',
        words: [
          { kanji: '優しい', hiragana: 'やさしい', meaning_es: 'Amable / Cariñoso / Afectuoso', level: 'N5' },
          { kanji: '親切', hiragana: 'しんせつ', meaning_es: 'Atento / Servicial con los demás', level: 'N5' },
          { kanji: '厳しい', hiragana: 'きびしい', meaning_es: 'Estricto / Riguroso', level: 'N4' },
          { kanji: '面白い', hiragana: 'おもしろい', meaning_es: 'Interesante / Gracioso', level: 'N5' },
          { kanji: '静か', hiragana: 'しずか', meaning_es: 'Tranquilo / Callado / Silencioso', level: 'N5' },
          { kanji: '賑やか', hiragana: 'にぎやか', meaning_es: 'Animado / Bullicioso', level: 'N5' },
          { kanji: '真面目', hiragana: 'まじめ', meaning_es: 'Serio / Trabajador y responsable', level: 'N4' },
          { kanji: '素直', hiragana: 'すなお', meaning_es: 'Dócil / Franco y sincero', level: 'N3' },
          { kanji: '勇気', hiragana: 'ゆうき', meaning_es: 'Coraje / Valentía', level: 'N3' },
          { kanji: '礼儀', hiragana: 'れいぎ', meaning_es: 'Buenos modales / Cortesía', level: 'N3' }
        ]
      },
      {
        id: 'u8-l4-pensamiento-memoria',
        number: 4,
        title: 'Pensamiento, memoria y opiniones',
        japanese_title: '思考・記憶・意見',
        description: 'Pensar, recordar, olvidar, entender y decidir',
        words: [
          { kanji: '思う', hiragana: 'おもう', meaning_es: 'Pensar / Creer / Opinar', level: 'N5' },
          { kanji: '考える', hiragana: 'かんがえる', meaning_es: 'Meditar / Reflexionar detenidamente', level: 'N5' },
          { kanji: '忘れる', hiragana: 'わすれる', meaning_es: 'Olvidar', level: 'N5' },
          { kanji: '思い出す', hiragana: 'おもいだす', meaning_es: 'Recordar / Traer a la memoria', level: 'N5' },
          { kanji: '知る', hiragana: 'しる', meaning_es: 'Saber / Conocer un dato', level: 'N5' },
          { kanji: '分かる', hiragana: 'わかる', meaning_es: 'Entender / Comprender', level: 'N5' },
          { kanji: '信じる', hiragana: 'しんじる', meaning_es: 'Creer en / Confiar en alguien', level: 'N4' },
          { kanji: '望む', hiragana: 'のぞむ', meaning_es: 'Desear / Anhelar', level: 'N3' },
          { kanji: '意見', hiragana: 'いけん', meaning_es: 'Opinión / Punto de vista', level: 'N5' },
          { kanji: '決める', hiragana: 'きめる', meaning_es: 'Decidir / Determinar', level: 'N5' }
        ]
      },
      {
        id: 'u8-l5-musica-artes',
        number: 5,
        title: 'Música, arte y espectáculos',
        japanese_title: '音楽・美術・芸能',
        description: 'Canciones, películas, fotografía, cuadros y cine',
        words: [
          { kanji: '音楽', hiragana: 'おんがく', meaning_es: 'Música', level: 'N5' },
          { kanji: '歌', hiragana: 'うた', meaning_es: 'Canción', level: 'N5' },
          { kanji: '映画', hiragana: 'えいが', meaning_es: 'Película de cine', level: 'N5' },
          { kanji: '写真', hiragana: 'しゃしん', meaning_es: 'Fotografía', level: 'N5' },
          { kanji: '絵', hiragana: 'え', meaning_es: 'Pintura / Dibujo / Cuadro', level: 'N5' },
          { kanji: '楽器', hiragana: 'がっき', meaning_es: 'Instrumento musical', level: 'N4' },
          { kanji: 'ピアノ', hiragana: 'ぴあの', meaning_es: 'Piano', level: 'N5' },
          { kanji: 'ギター', hiragana: 'ぎたー', meaning_es: 'Guitarra', level: 'N5' },
          { kanji: '劇場', hiragana: 'げきじょう', meaning_es: 'Teatro', level: 'N4' },
          { kanji: 'アニメ', hiragana: 'あにめ', meaning_es: 'Animación japonesa (Anime)', level: 'N5' }
        ]
      },
      {
        id: 'u8-l6-deportes-actividades',
        number: 6,
        title: 'Deportes y actividades físicas',
        japanese_title: '運動・スポーツ・競技',
        description: 'Fútbol, béisbol, natación, caminatas y partidos',
        words: [
          { kanji: 'スポーツ', hiragana: 'すぽーつ', meaning_es: 'Deporte en general', level: 'N5' },
          { kanji: 'サッカー', hiragana: 'さっかー', meaning_es: 'Fútbol', level: 'N5' },
          { kanji: '野球', hiragana: 'やきゅう', meaning_es: 'Béisbol', level: 'N5' },
          { kanji: '水泳', hiragana: 'すいえい', meaning_es: 'Natación', level: 'N4' },
          { kanji: 'テニス', hiragana: 'てにす', meaning_es: 'Tenis', level: 'N5' },
          { kanji: '散歩', hiragana: 'さんぽ', meaning_es: 'Paseo / Caminata relajada', level: 'N5' },
          { kanji: '登山', hiragana: 'とざん', meaning_es: 'Montañismo / Escalar cumbres', level: 'N4' },
          { kanji: '試合', hiragana: 'しあい', meaning_es: 'Partido / Encuentro deportivo', level: 'N4' },
          { kanji: '勝つ', hiragana: 'かつ', meaning_es: 'Ganar / Vencer en competición', level: 'N4' },
          { kanji: '負ける', hiragana: 'まける', meaning_es: 'Perder / Ser derrotado', level: 'N4' }
        ]
      },
      {
        id: 'u8-l7-tradiciones-japonesas',
        number: 7,
        title: 'Tradiciones y patrimonio japonés',
        japanese_title: '日本伝統・風習・遺産',
        description: 'Kimonos, flores de cerezo, templos, santuarios y onsen',
        words: [
          { kanji: '着物', hiragana: 'きもの', meaning_es: 'Kimono tradicional', level: 'N4' },
          { kanji: '桜', hiragana: 'さくら', meaning_es: 'Flor de cerezo', level: 'N5' },
          { kanji: '祭り', hiragana: 'まつり', meaning_es: 'Festival tradicional (Matsuri)', level: 'N5' },
          { kanji: 'お寺', hiragana: 'おてら', meaning_es: 'Templo budista', level: 'N5' },
          { kanji: '神社', hiragana: 'じんじゃ', meaning_es: 'Santuario sintoísta', level: 'N4' },
          { kanji: '温泉', hiragana: 'おんせん', meaning_es: 'Aguas termales japonesas (Onsen)', level: 'N4' },
          { kanji: '歌舞伎', hiragana: 'かぶき', meaning_es: 'Teatro clásico Kabuki', level: 'N4' },
          { kanji: '茶道', hiragana: 'さどう', meaning_es: 'Ceremonia tradicional del té', level: 'N4' },
          { kanji: '俳句', hiragana: 'はいく', meaning_es: 'Poesía japonesa haiku', level: 'N4' },
          { kanji: '侍', hiragana: 'さむらい', meaning_es: 'Guerrero samurái', level: 'N4' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // UNIDAD 9: Préstamos y Léxico Moderno en Katakana
  // -------------------------------------------------------------
  {
    id: 'unit-9-katakana-prestamos',
    title: 'Unidad 9: Préstamos y Léxico Moderno en Katakana',
    japanese_title: '外来語・カタカナ語マスター',
    subtitle: 'Palabras extranjeras adaptadas: informática, cafetería, moda y ocio',
    kanji_icon: 'カ',
    color: '#3b82f6',
    bg_gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    track: 'katakana',
    lessons: [
      {
        id: 'u9-l1-tecnologia-internet',
        number: 1,
        title: 'Tecnología, internet y computación',
        japanese_title: 'IT・ネット・デジタル',
        description: 'Ordenadores, apps, pantallas y contraseñas',
        words: [
          { kanji: 'パソコン', hiragana: 'ぱそこん', meaning_es: 'Ordenador portátil o de mesa', level: 'N5' },
          { kanji: 'スマホ', hiragana: 'すまほ', meaning_es: 'Teléfono inteligente / Smartphone', level: 'N5' },
          { kanji: 'インターネット', hiragana: 'いんたーねっと', meaning_es: 'Internet / Red', level: 'N5' },
          { kanji: 'アプリ', hiragana: 'あぷり', meaning_es: 'Aplicación informática / App', level: 'N5' },
          { kanji: 'データ', hiragana: 'でーた', meaning_es: 'Datos digitales', level: 'N4' },
          { kanji: 'メール', hiragana: 'めーる', meaning_es: 'Correo electrónico', level: 'N5' },
          { kanji: '画面', hiragana: 'がめん', meaning_es: 'Pantalla digital', level: 'N4' },
          { kanji: 'パスワード', hiragana: 'ぱすわーど', meaning_es: 'Contraseña de acceso', level: 'N4' },
          { kanji: 'オンライン', hiragana: 'おんらいん', meaning_es: 'En línea / Online', level: 'N4' },
          { kanji: 'クリック', hiragana: 'くりっく', meaning_es: 'Clic de ratón', level: 'N4' }
        ]
      },
      {
        id: 'u9-l2-cafeteria-comida-rapida',
        number: 2,
        title: 'Cafetería, bebidas y comida rápida',
        japanese_title: 'カフェ・ファストフード・軽食',
        description: 'Café, tartas, sándwiches, zumos y helados',
        words: [
          { kanji: 'コーヒー', hiragana: 'こーひー', meaning_es: 'Café', level: 'N5' },
          { kanji: 'ティー', hiragana: 'てぃー', meaning_es: 'Té occidental', level: 'N5' },
          { kanji: 'カフェ', hiragana: 'かふぇ', meaning_es: 'Cafetería moderna', level: 'N5' },
          { kanji: 'ケーキ', hiragana: 'けーき', meaning_es: 'Tarta / Pastel', level: 'N5' },
          { kanji: 'サンドイッチ', hiragana: 'さんどいっち', meaning_es: 'Sándwich / Emparedado', level: 'N5' },
          { kanji: 'ハンバーガー', hiragana: 'はんばーがー', meaning_es: 'Hamburguesa', level: 'N5' },
          { kanji: 'ジュース', hiragana: 'じゅーす', meaning_es: 'Zumo / Jugo de frutas', level: 'N5' },
          { kanji: 'アイスクリーム', hiragana: 'あいすくりーむ', meaning_es: 'Helado', level: 'N5' },
          { kanji: 'パン', hiragana: 'ぱん', meaning_es: 'Pan', level: 'N5' },
          { kanji: 'スープ', hiragana: 'すーぷ', meaning_es: 'Sopa occidental / Crema', level: 'N5' }
        ]
      },
      {
        id: 'u9-l3-ropa-occidental-moda',
        number: 3,
        title: 'Ropa occidental y accesorios de moda',
        japanese_title: '洋服・ファッション・装飾品',
        description: 'Camisas, chaquetas, vestidos, bolsos y calzado moderno',
        words: [
          { kanji: 'シャツ', hiragana: 'しゃつ', meaning_es: 'Camisa', level: 'N5' },
          { kanji: 'ズボン', hiragana: 'ずぼん', meaning_es: 'Pantalones', level: 'N5' },
          { kanji: 'スカート', hiragana: 'すかーと', meaning_es: 'Falda', level: 'N5' },
          { kanji: 'ジャケット', hiragana: 'じゃけっと', meaning_es: 'Chaqueta / Cazadora', level: 'N5' },
          { kanji: 'ドレス', hiragana: 'どれす', meaning_es: 'Vestido de fiesta', level: 'N4' },
          { kanji: 'スニーカー', hiragana: 'すにーかー', meaning_es: 'Zapatillas deportivas / Bambas', level: 'N5' },
          { kanji: 'バッグ', hiragana: 'ばっぐ', meaning_es: 'Bolso de mano', level: 'N5' },
          { kanji: 'ネクタイ', hiragana: 'ねくたい', meaning_es: 'Corbata', level: 'N5' },
          { kanji: 'アクセサリー', hiragana: 'あくせさりー', meaning_es: 'Accesorios y bisutería', level: 'N4' },
          { kanji: 'ブーツ', hiragana: 'ぶーつ', meaning_es: 'Botas de vestir', level: 'N5' }
        ]
      },
      {
        id: 'u9-l4-deportes-internacionales',
        number: 4,
        title: 'Deportes internacionales y recreación',
        japanese_title: '国際スポーツ・レジャー',
        description: 'Fútbol, tenis, baloncesto, golf, piscina y esquí',
        words: [
          { kanji: 'サッカー', hiragana: 'さっかー', meaning_es: 'Fútbol', level: 'N5' },
          { kanji: 'テニス', hiragana: 'てにす', meaning_es: 'Tenis', level: 'N5' },
          { kanji: 'バスケ', hiragana: 'ばすけ', meaning_es: 'Baloncesto / Básquetbol', level: 'N5' },
          { kanji: 'ゴルフ', hiragana: 'ごるふ', meaning_es: 'Golf', level: 'N5' },
          { kanji: 'プール', hiragana: 'ぷーる', meaning_es: 'Piscina de natación', level: 'N5' },
          { kanji: 'マラソン', hiragana: 'まらそん', meaning_es: 'Maratón de atletismo', level: 'N4' },
          { kanji: 'ジム', hiragana: 'じむ', meaning_es: 'Gimnasio de entrenamiento', level: 'N5' },
          { kanji: 'スキー', hiragana: 'すきー', meaning_es: 'Esquí sobre nieve', level: 'N5' },
          { kanji: 'スケート', hiragana: 'すけーと', meaning_es: 'Patinaje sobre hielo', level: 'N5' },
          { kanji: 'ボール', hiragana: 'ぼーる', meaning_es: 'Pelota / Balón deportivo', level: 'N5' }
        ]
      },
      {
        id: 'u9-l5-viajes-hoteles-ciudad',
        number: 5,
        title: 'Viajes, hoteles y vida urbana',
        japanese_title: 'ホテル・観光・都市設備',
        description: 'Hoteles, ascensores, billetes, recepción y taxis',
        words: [
          { kanji: 'ホテル', hiragana: 'ほてる', meaning_es: 'Hotel', level: 'N5' },
          { kanji: 'レストラン', hiragana: 'れすとらん', meaning_es: 'Restaurante', level: 'N5' },
          { kanji: 'エレベーター', hiragana: 'えれべーたー', meaning_es: 'Ascensor / Elevador', level: 'N5' },
          { kanji: 'トイレ', hiragana: 'といれ', meaning_es: 'Servicio / Baño / Aseo', level: 'N5' },
          { kanji: 'フロント', hiragana: 'ふろんと', meaning_es: 'Recepción del hotel', level: 'N4' },
          { kanji: 'タクシー', hiragana: 'たくしー', meaning_es: 'Taxi', level: 'N5' },
          { kanji: 'バス', hiragana: 'ばす', meaning_es: 'Autobús', level: 'N5' },
          { kanji: 'チケット', hiragana: 'ちけっと', meaning_es: 'Billete de entrada o viaje', level: 'N5' },
          { kanji: 'ビル', hiragana: 'びる', meaning_es: 'Edificio comercial', level: 'N5' },
          { kanji: 'ドア', hiragana: 'どあ', meaning_es: 'Puerta batiente', level: 'N5' }
        ]
      },
      {
        id: 'u9-l6-entretenimiento-medios',
        number: 6,
        title: 'Entretenimiento, medios y pasatiempos',
        japanese_title: 'メディア・エンタメ・娯楽',
        description: 'Televisión, radio, guitarras, conciertos y videojuegos',
        words: [
          { kanji: 'テレビ', hiragana: 'てれび', meaning_es: 'Televisor / Televisión', level: 'N5' },
          { kanji: 'ラジオ', hiragana: 'らじお', meaning_es: 'Radio', level: 'N5' },
          { kanji: 'ギター', hiragana: 'ぎたー', meaning_es: 'Guitarra', level: 'N5' },
          { kanji: 'ピアノ', hiragana: 'ぴあの', meaning_es: 'Piano', level: 'N5' },
          { kanji: 'コンサート', hiragana: 'こんさーと', meaning_es: 'Concierto musical', level: 'N5' },
          { kanji: 'アニメ', hiragana: 'あにめ', meaning_es: 'Animación (Anime)', level: 'N5' },
          { kanji: 'ドラマ', hiragana: 'どらま', meaning_es: 'Serie dramática / Telenovela', level: 'N5' },
          { kanji: 'アイドル', hiragana: 'あいどる', meaning_es: 'Ídolo juvenil del pop', level: 'N4' },
          { kanji: 'ゲーム', hiragana: 'げーむ', meaning_es: 'Videojuego', level: 'N5' },
          { kanji: 'カメラ', hiragana: 'かめら', meaning_es: 'Cámara de fotos', level: 'N5' }
        ]
      }
    ]
  }
];

// =========================================================================
// ENSAMBLAJE FINAL, CONSTRUCCIÓN DE PALABRAS Y SINCRONIZACIÓN (Regla 1 y 2)
// =========================================================================

const allCompiledWords = [];
const scriptpadOutput = unitsDefinition.map(unit => {
  const processedLessons = unit.lessons.map(lesson => {
    const formattedWords = lesson.words.map(w => {
      const fullWord = formatWord(w, lesson.title);
      allCompiledWords.push(fullWord);
      return fullWord;
    });

    return {
      id: lesson.id,
      number: lesson.number,
      title: lesson.title, // Título limpio con sólo el contexto de palabras (Regla de Usuario)
      japanese_title: lesson.japanese_title || lesson.title,
      description: lesson.description || `${lesson.title} en japonés`,
      words: formattedWords
    };
  });

  const totalWords = processedLessons.reduce((acc, l) => acc + l.words.length, 0);

  return {
    id: unit.id,
    title: unit.title,
    japanese_title: unit.japanese_title,
    subtitle: unit.subtitle,
    kanji_icon: unit.kanji_icon,
    color: unit.color,
    bg_gradient: unit.bg_gradient,
    track: unit.track,
    total_words: totalWords,
    lessons_count: processedLessons.length,
    lessons: processedLessons
  };
});

// Guardar data/scriptpad_units.json
fs.writeFileSync(outputPath, JSON.stringify(scriptpadOutput, null, 2), 'utf8');
console.log('✅ data/scriptpad_units.json generado exitosamente.');
console.log(`Total Unidades: ${scriptpadOutput.length}`);
let grandTotal = 0;
scriptpadOutput.forEach(u => {
  grandTotal += u.total_words;
  console.log(`- [${u.kanji_icon}] ${u.title}: ${u.lessons_count} lecciones, ${u.total_words} palabras`);
});
console.log(`TOTAL PALABRAS EN SCRIPTPAD: ${grandTotal}`);

// =========================================================================
// SINCRONIZACIÓN CON data/vocabulary.json y data/kanji.json (Reglas 1 y 2)
// =========================================================================

// 1. Sincronizar palabras nuevas en data/vocabulary.json
const vocabMap = new Map();
vocabData.forEach(item => {
  const k = (item.kanji || item.word || item.hiragana || item.kana || '').trim();
  if (k) vocabMap.set(k, item);
});

let addedToVocab = 0;
allCompiledWords.forEach(w => {
  const key = w.kanji || w.hiragana;
  if (!vocabMap.has(key)) {
    vocabMap.set(key, {
      id: w.id,
      kanji: w.kanji,
      hiragana: w.hiragana,
      katakana: w.katakana,
      romaji: w.romaji,
      meaning_es: w.meaning_es,
      level: w.level,
      category: w.category,
      audio_url: w.audio_url || ''
    });
    addedToVocab++;
  }
});

if (addedToVocab > 0) {
  const newVocabList = Array.from(vocabMap.values());
  fs.writeFileSync(vocabPath, JSON.stringify(newVocabList, null, 2), 'utf8');
  console.log(`✅ ${addedToVocab} nuevas palabras sincronizadas en data/vocabulary.json.`);
} else {
  console.log('ℹ️ data/vocabulary.json ya tenía todas las palabras registradas.');
}

// 2. Sincronizar kanji.json (Regla 2: Cada palabra con kanji debe estar en words de CADA kanji que la contiene)
let kanjiSyncCount = 0;
kanjiData.forEach(kEntry => {
  const char = kEntry.kanji;
  if (!char) return;
  if (!Array.isArray(kEntry.words)) {
    kEntry.words = [];
  }

  // Buscar todas las palabras del scriptpad que contienen este kanji
  allCompiledWords.forEach(w => {
    if (w.kanji && w.kanji.includes(char)) {
      const alreadyHas = kEntry.words.some(ex => (ex.word === w.kanji || ex.kanji === w.kanji));
      if (!alreadyHas) {
        kEntry.words.push({
          word: w.kanji,
          reading: w.hiragana,
          meaning: w.meaning_es
        });
        kanjiSyncCount++;
      }
    }
  });
});

fs.writeFileSync(kanjiPath, JSON.stringify(kanjiData, null, 2), 'utf8');
console.log(`✅ ${kanjiSyncCount} asociaciones de palabras añadidas a data/kanji.json.`);
