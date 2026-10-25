const fs = require('fs');
const path = require('path');
const wanakana = require('wanakana');

// Master data paths
const vocabPath = path.join(__dirname, '../data/vocabulary.json');
const dictPath = path.join(__dirname, '../data/dictionary.json');
const kanjiPath = path.join(__dirname, '../data/kanji.json');
const scriptpadPath = path.join(__dirname, '../data/scriptpad_units.json');

const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
const dictData = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
const kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

// Build lookup map
const existingLookup = new Map();
[...vocabData, ...dictData].forEach(item => {
  const k = (item.kanji || item.word || item.hiragana || item.kana || '').trim();
  if (k && !existingLookup.has(k)) {
    existingLookup.set(k, item);
  }
});

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
// DEFINICIÓN DE LAS 10 UNIDADES FUSIONADAS CON CERO DUPLICADOS DE PALABRAS
// =========================================================================

const fusedUnitsDefinition = [
  // -----------------------------------------------------------------------
  // UNIDAD 1: Fundamentos, Números y Tiempo
  // -----------------------------------------------------------------------
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
        title: 'Números ordinales y fracciones',
        japanese_title: '順序・割合・分数',
        description: 'Orden sucesivo, partes divididas y porcentajes',
        words: [
          { kanji: '第一', hiragana: 'だいいち', meaning_es: 'Primero / Número uno', level: 'N4' },
          { kanji: '第二', hiragana: 'だいに', meaning_es: 'Segundo / Número dos', level: 'N4' },
          { kanji: '第三', hiragana: 'だいさん', meaning_es: 'Tercero / Número tres', level: 'N4' },
          { kanji: '第四', hiragana: 'だいよん', meaning_es: 'Cuarto / Número cuatro', level: 'N4' },
          { kanji: '第五', hiragana: 'だいご', meaning_es: 'Quinto / Número cinco', level: 'N4' },
          { kanji: '一番', hiragana: 'いちばん', meaning_es: 'El más / Primero', level: 'N5' },
          { kanji: '一番目', hiragana: 'いちばんめ', meaning_es: 'El primer lugar', level: 'N5' },
          { kanji: '二番目', hiragana: 'にばんめ', meaning_es: 'Segundo en turno', level: 'N5' },
          { kanji: '三番目', hiragana: 'さんばんめ', meaning_es: 'Tercero en turno', level: 'N5' },
          { kanji: '半分', hiragana: 'はんぶん', meaning_es: 'La mitad (1/2)', level: 'N5' },
          { kanji: '三分の一', hiragana: 'さんぶんのいち', meaning_es: 'Un tercio (1/3)', level: 'N4' },
          { kanji: '四分の一', hiragana: 'よんぶんのいち', meaning_es: 'Un cuarto (1/4)', level: 'N4' },
          { kanji: '五分の一', hiragana: 'ごぶんのいち', meaning_es: 'Un quinto (1/5)', level: 'N4' },
          { kanji: '二倍', hiragana: 'にばい', meaning_es: 'El doble (2x)', level: 'N4' },
          { kanji: '三倍', hiragana: 'さんばい', meaning_es: 'El triple (3x)', level: 'N4' },
          { kanji: '四倍', hiragana: 'よんばい', meaning_es: 'El cuádruple (4x)', level: 'N4' },
          { kanji: '百分率', hiragana: 'ひゃくぶんりつ', meaning_es: 'Porcentaje', level: 'N3' },
          { kanji: '初めて', hiragana: 'はじめて', meaning_es: 'Por primera vez', level: 'N5' },
          { kanji: '最後', hiragana: 'さいご', meaning_es: 'Último / Al final', level: 'N4' }
        ]
      },
      {
        id: 'u1-l5-matematicas-cantidades',
        title: 'Matemáticas y cantidades',
        japanese_title: '数量・計算・合計',
        description: 'Términos de cálculo, operaciones y mediciones cuantitativas',
        words: [
          { kanji: '数', hiragana: 'かず', meaning_es: 'Número / Cantidad', level: 'N4' },
          { kanji: '数学', hiragana: 'すうがく', meaning_es: 'Matemáticas', level: 'N4' },
          { kanji: '計算', hiragana: 'けいさん', meaning_es: 'Cálculo / Cuenta', level: 'N4' },
          { kanji: '足し算', hiragana: 'たしざん', meaning_es: 'Suma', level: 'N4' },
          { kanji: '引き算', hiragana: 'ひきざん', meaning_es: 'Resta', level: 'N4' },
          { kanji: '掛け算', hiragana: 'かけざん', meaning_es: 'Multiplicación', level: 'N4' },
          { kanji: '割り算', hiragana: 'わりざん', meaning_es: 'División', level: 'N4' },
          { kanji: '合計', hiragana: 'ごうけい', meaning_es: 'Total acumulado', level: 'N4' },
          { kanji: '平均', hiragana: 'へいきん', meaning_es: 'Promedio / Media', level: 'N3' },
          { kanji: '全部', hiragana: 'ぜんぶ', meaning_es: 'Todo / Totalidad', level: 'N5' },
          { kanji: '少し', hiragana: 'すこし', meaning_es: 'Un poco / Poco', level: 'N5' },
          { kanji: '多い', hiragana: 'おおい', meaning_es: 'Mucho / Abundante', level: 'N5' },
          { kanji: '少ない', hiragana: 'すくない', meaning_es: 'Escaso / Pocos', level: 'N5' },
          { kanji: '多数', hiragana: 'たすう', meaning_es: 'Mayoría / Gran cantidad', level: 'N3' },
          { kanji: '少数', hiragana: 'しょうすう', meaning_es: 'Minoría / Cantidad pequeña', level: 'N3' },
          { kanji: '十分', hiragana: 'じゅうぶん', meaning_es: 'Suficiente / Bastante', level: 'N4' },
          { kanji: '不足', hiragana: 'ふそく', meaning_es: 'Insuficiente / Falta', level: 'N4' },
          { kanji: '測る', hiragana: 'はかる', meaning_es: 'Medir', level: 'N4' },
          { kanji: '重さ', hiragana: 'おもさ', meaning_es: 'Peso', level: 'N4' },
          { kanji: '長さ', hiragana: 'ながさ', meaning_es: 'Longitud', level: 'N4' },
          { kanji: '算数', hiragana: 'さんすう', meaning_es: 'Aritmética elemental', level: 'N4' },
          { kanji: '半額', hiragana: 'はんがく', meaning_es: 'Mitad de precio', level: 'N4' }
        ]
      },
      {
        id: 'u1-l6-dias-semana',
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
          { kanji: '正午', hiragana: 'しょうご', meaning_es: 'Mediodía exacto', level: 'N4' },
          { kanji: '真夜中', hiragana: 'まよなか', meaning_es: 'Medianoche', level: 'N4' }
        ]
      },
      {
        id: 'u1-l10-tiempo-relativo',
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
          { kanji: '今年', hiragana: 'ことし', meaning_es: 'Este año', level: 'N5' },
          { kanji: '毎日', hiragana: 'まいにち', meaning_es: 'Todos los días / Diario', level: 'N5' },
          { kanji: '週末', hiragana: 'しゅうまつ', meaning_es: 'Fin de semana', level: 'N5' }
        ]
      },
      {
        id: 'u1-l11-saludos-cortesia',
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
          { kanji: '方', hiragana: 'かた', meaning_es: 'Persona (respetuoso)', level: 'N5' },
          { kanji: '皆さん', hiragana: 'みなさん', meaning_es: 'Todos ustedes / Damas y caballeros', level: 'N5' },
          { kanji: '自分', hiragana: 'じぶん', meaning_es: 'Uno mismo / Por sí mismo', level: 'N4' }
        ]
      }
    ]
  },

  // -----------------------------------------------------------------------
  // UNIDAD 2: Animales, Colores, Formas y Naturaleza
  // -----------------------------------------------------------------------
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
          { kanji: '豹', hiragana: 'ひょう', meaning_es: 'Leopardo', level: 'N3' },
          { kanji: '縞馬', hiragana: 'しまうま', meaning_es: 'Cebra', level: 'N4' },
          { kanji: 'カバ', hiragana: 'かば', meaning_es: 'Hipopótamo', level: 'N4' },
          { kanji: 'サイ', hiragana: 'さい', meaning_es: 'Rinoceronte', level: 'N4' },
          { kanji: 'ゴリラ', hiragana: 'ごりら', meaning_es: 'Gorila', level: 'N5' },
          { kanji: 'チーター', hiragana: 'ちーたー', meaning_es: 'Guepardo', level: 'N4' },
          { kanji: '白熊', hiragana: 'しろくま', meaning_es: 'Oso polar', level: 'N4' },
          { kanji: 'コアラ', hiragana: 'こあら', meaning_es: 'Koala', level: 'N5' },
          { kanji: '動物', hiragana: 'どうぶつ', meaning_es: 'Animal (concepto general)', level: 'N5' },
          { kanji: '動物園', hiragana: 'どうぶつえん', meaning_es: 'Zoológico', level: 'N5' }
        ]
      },
      {
        id: 'u2-l3-animales-granja',
        title: 'Animales de granja y campo',
        japanese_title: '家畜・牧場の動物',
        description: 'Especies domesticadas de corral y pastoreo',
        words: [
          { kanji: '牛', hiragana: 'うし', meaning_es: 'Vaca / Res', level: 'N5' },
          { kanji: '馬', hiragana: 'うま', meaning_es: 'Caballo', level: 'N5' },
          { kanji: '豚', hiragana: 'ぶた', meaning_es: 'Cerdo', level: 'N5' },
          { kanji: '羊', hiragana: 'ひつじ', meaning_es: 'Oveja', level: 'N4' },
          { kanji: '山羊', hiragana: 'やぎ', meaning_es: 'Cabra', level: 'N4' },
          { kanji: '鶏', hiragana: 'にわとり', meaning_es: 'Pollo / Gallina', level: 'N5' },
          { kanji: 'アヒル', hiragana: 'あひる', meaning_es: 'Pato doméstico', level: 'N5' },
          { kanji: '雄牛', hiragana: 'おうし', meaning_es: 'Toro', level: 'N4' },
          { kanji: 'ロバ', hiragana: 'ろば', meaning_es: 'Burro / Asno', level: 'N4' },
          { kanji: 'ガチョウ', hiragana: 'がちょう', meaning_es: 'Oca / Ganso', level: 'N4' },
          { kanji: '雄鶏', hiragana: 'おんどり', meaning_es: 'Gallo', level: 'N4' },
          { kanji: '雌鶏', hiragana: 'めんどり', meaning_es: 'Gallina ponedora', level: 'N4' },
          { kanji: '七面鳥', hiragana: 'しちめんちょう', meaning_es: 'Pavo', level: 'N3' },
          { kanji: '仔馬', hiragana: 'こうま', meaning_es: 'Potro / Cría de caballo', level: 'N4' }
        ]
      },
      {
        id: 'u2-l4-aves-pajaros',
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
          { kanji: 'ペンギン', hiragana: 'ぺんぎん', meaning_es: 'Pingüino', level: 'N5' },
          { kanji: '鶴', hiragana: 'つる', meaning_es: 'Grulla', level: 'N4' },
          { kanji: '鴎', hiragana: 'かもめ', meaning_es: 'Gaviota', level: 'N3' },
          { kanji: '梟', hiragana: 'ふくろう', meaning_es: 'Búho', level: 'N4' },
          { kanji: '雉', hiragana: 'きじ', meaning_es: 'Faisán', level: 'N3' },
          { kanji: 'オウム', hiragana: 'おうむ', meaning_es: 'Loro', level: 'N3' },
          { kanji: 'フラミンゴ', hiragana: 'ふらみんご', meaning_es: 'Flamenco', level: 'N4' }
        ]
      },
      {
        id: 'u2-l5-criaturas-marinas',
        title: 'Peces y criaturas marinas',
        japanese_title: '魚類・海の生物',
        description: 'Habitantes del océano, ríos y lagos',
        words: [
          { kanji: '鯨', hiragana: 'くじら', meaning_es: 'Ballena', level: 'N4' },
          { kanji: 'イルカ', hiragana: 'いるか', meaning_es: 'Delfín', level: 'N5' },
          { kanji: '鮫', hiragana: 'さめ', meaning_es: 'Tiburón', level: 'N4' },
          { kanji: '蛸', hiragana: 'たこ', meaning_es: 'Pulpo', level: 'N4' },
          { kanji: '烏賊', hiragana: 'いか', meaning_es: 'Calamar', level: 'N4' },
          { kanji: '蟹', hiragana: 'かに', meaning_es: 'Cangrejo', level: 'N4' },
          { kanji: '海老', hiragana: 'えび', meaning_es: 'Camarón / Gamba', level: 'N4' },
          { kanji: '貝', hiragana: 'かい', meaning_es: 'Molusco / Concha', level: 'N4' },
          { kanji: '海亀', hiragana: 'うみがめ', meaning_es: 'Tortuga marina', level: 'N4' },
          { kanji: 'クラゲ', hiragana: 'くらげ', meaning_es: 'Medusa', level: 'N4' },
          { kanji: '浅蜊', hiragana: 'あさり', meaning_es: 'Almeja', level: 'N4' },
          { kanji: 'アシカ', hiragana: 'あしか', meaning_es: 'León marino', level: 'N4' },
          { kanji: 'ラッコ', hiragana: 'らっこ', meaning_es: 'Nutria marina', level: 'N4' },
          { kanji: '珊瑚', hiragana: 'さんご', meaning_es: 'Coral', level: 'N3' },
          { kanji: '水族館', hiragana: 'すいぞくかん', meaning_es: 'Acuario público', level: 'N4' }
        ]
      },
      {
        id: 'u2-l6-insectos-bichos',
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
          { kanji: '蛍', hiragana: 'ほたる', meaning_es: 'Luciérnaga', level: 'N4' },
          { kanji: 'トンボ', hiragana: 'とんぼ', meaning_es: 'Libélula', level: 'N4' },
          { kanji: 'コオロギ', hiragana: 'こおろぎ', meaning_es: 'Grillo', level: 'N4' },
          { kanji: 'カマキリ', hiragana: 'かまきり', meaning_es: 'Mantis religiosa', level: 'N4' },
          { kanji: 'テントウムシ', hiragana: 'てんとうむし', meaning_es: 'Mariquita', level: 'N4' },
          { kanji: 'ムカデ', hiragana: 'むかで', meaning_es: 'Ciempiés', level: 'N3' },
          { kanji: '毛虫', hiragana: 'けむし', meaning_es: 'Oruga', level: 'N4' },
          { kanji: '蚤', hiragana: 'のみ', meaning_es: 'Pulga', level: 'N3' }
        ]
      },
      {
        id: 'u2-l7-reptiles-anfibios',
        title: 'Reptiles y anfibios',
        japanese_title: '爬虫類・両生類',
        description: 'Serpientes, ranas, salamandras y lagartos',
        words: [
          { kanji: '蛇', hiragana: 'へび', meaning_es: 'Serpiente / Culebra', level: 'N4' },
          { kanji: '蛙', hiragana: 'かえる', meaning_es: 'Rana', level: 'N4' },
          { kanji: '蜥蜴', hiragana: 'とかげ', meaning_es: 'Lagartija / Lagarto', level: 'N4' },
          { kanji: '鰐', hiragana: 'わに', meaning_es: 'Cocodrilo', level: 'N4' },
          { kanji: 'ヤモリ', hiragana: 'やもり', meaning_es: 'Gueco casero', level: 'N5' },
          { kanji: 'オタマジャクシ', hiragana: 'おたまじゃくし', meaning_es: 'Renacuajo', level: 'N5' },
          { kanji: 'イモリ', hiragana: 'いもり', meaning_es: 'Tritón / Salamandra', level: 'N4' },
          { kanji: '毒蛇', hiragana: 'どくへび', meaning_es: 'Serpiente venenosa', level: 'N4' },
          { kanji: 'カメレオン', hiragana: 'かめれおん', meaning_es: 'Camaleón', level: 'N4' }
        ]
      },
      {
        id: 'u2-l8-colores-principales',
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
          { kanji: '紫', hiragana: 'むらさき', meaning_es: 'Morado / Violeta', level: 'N4' },
          { kanji: '金色', hiragana: 'きんいろ', meaning_es: 'Color dorado', level: 'N4' },
          { kanji: '銀色', hiragana: 'ぎんいろ', meaning_es: 'Color plateado', level: 'N4' },
          { kanji: '水色', hiragana: 'みずいろ', meaning_es: 'Celeste / Azul claro', level: 'N4' },
          { kanji: '紺色', hiragana: 'こんいろ', meaning_es: 'Azul marino', level: 'N4' }
        ]
      },
      {
        id: 'u2-l9-formas-dimensiones',
        title: 'Formas geométricas y dimensiones',
        japanese_title: '形・図形・サイズ',
        description: 'Círculos, cuadrados, longitud, grosor y proporciones',
        words: [
          { kanji: '丸', hiragana: 'まる', meaning_es: 'Círculo / Redondo', level: 'N5' },
          { kanji: '四角', hiragana: 'しかく', meaning_es: 'Cuadrado / Rectángulo', level: 'N4' },
          { kanji: '三角', hiragana: 'さんかく', meaning_es: 'Triángulo', level: 'N4' },
          { kanji: '形', hiragana: 'かたち', meaning_es: 'Forma / Figura', level: 'N4' },
          { kanji: '星形', hiragana: 'ほしがた', meaning_es: 'Forma de estrella', level: 'N4' },
          { kanji: '円形', hiragana: 'えんけい', meaning_es: 'Forma circular', level: 'N3' },
          { kanji: '楕円', hiragana: 'だえん', meaning_es: 'Elipse / Óvalo', level: 'N3' },
          { kanji: '立方体', hiragana: 'りっぽうたい', meaning_es: 'Cubo geométrico', level: 'N3' },
          { kanji: '大きい', hiragana: 'おおきい', meaning_es: 'Grande', level: 'N5' },
          { kanji: '小さい', hiragana: 'ちいさい', meaning_es: 'Pequeño', level: 'N5' },
          { kanji: '長い', hiragana: 'ながい', meaning_es: 'Largo', level: 'N5' },
          { kanji: '短い', hiragana: 'みじかい', meaning_es: 'Corto', level: 'N5' },
          { kanji: '太い', hiragana: 'ふとい', meaning_es: 'Grueso / Gordo', level: 'N5' },
          { kanji: '細い', hiragana: 'ほそい', meaning_es: 'Delgado / Fino', level: 'N5' }
        ]
      },
      {
        id: 'u2-l12-texturas-superficies',
        title: 'Texturas y superficies',
        japanese_title: '質感・表面・感触',
        description: 'Cualidades táctiles: suave, áspero, duro, blando, liso y pegajoso',
        words: [
          { kanji: '滑らか', hiragana: 'なめらか', meaning_es: 'Liso / Suave / Terso', level: 'N3' },
          { kanji: 'ざらざら', hiragana: 'ざらざら', meaning_es: 'Áspero / Rugoso', level: 'N3' },
          { kanji: '固い', hiragana: 'かたい', meaning_es: 'Duro / Rígido', level: 'N4' },
          { kanji: '柔らかい', hiragana: 'やわらかい', meaning_es: 'Blando / Suave', level: 'N4' },
          { kanji: 'つるつる', hiragana: 'つるつる', meaning_es: 'Resbaladizo / Muy suave y liso', level: 'N3' },
          { kanji: 'べたべた', hiragana: 'べたべた', meaning_es: 'Pegajoso', level: 'N3' },
          { kanji: '乾いた', hiragana: 'かわいた', meaning_es: 'Seco', level: 'N4' },
          { kanji: '湿った', hiragana: 'しめった', meaning_es: 'Húmedo', level: 'N3' },
          { kanji: '平ら', hiragana: 'たいら', meaning_es: 'Plano / Llano', level: 'N3' },
          { kanji: '粗い', hiragana: 'あらい', meaning_es: 'Basto / Áspero', level: 'N3' },
          { kanji: '鋭い', hiragana: 'するどい', meaning_es: 'Afilado / Agudo', level: 'N3' },
          { kanji: '鈍い', hiragana: 'にぶい', meaning_es: 'Romo / Desafilado', level: 'N3' },
          { kanji: '表面', hiragana: 'ひょうめん', meaning_es: 'Superficie exterior', level: 'N3' }
        ]
      },
      {
        id: 'u2-l10-elementos-paisaje',
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
        title: 'Clima, tiempo atmosférico y estaciones',
        japanese_title: '季節・天気・気象',
        description: 'Las 4 estaciones del año y fenómenos meteorológicos',
        words: [
          { kanji: '春', hiragana: 'はる', meaning_es: 'Primavera', level: 'N5' },
          { kanji: '夏', hiragana: 'なつ', meaning_es: 'Verano', level: 'N5' },
          { kanji: '秋', hiragana: 'あき', meaning_es: 'Otoño', level: 'N5' },
          { kanji: '冬', hiragana: 'ふゆ', meaning_es: 'Invierno', level: 'N5' },
          { kanji: '季節', hiragana: 'きせつ', meaning_es: 'Estación del año', level: 'N4' },
          { kanji: '四季', hiragana: 'しき', meaning_es: 'Las cuatro estaciones', level: 'N3' },
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

  // -----------------------------------------------------------------------
  // UNIDAD 3: El Cuerpo Humano, la Salud y los Sentidos
  // -----------------------------------------------------------------------
  {
    id: 'unit-3-cuerpo-salud',
    title: 'Unidad 3: El Cuerpo Humano, la Salud y los Sentidos',
    japanese_title: '身体・健康・医学',
    subtitle: 'Anatomía, partes corporales, sentidos, fisiología, síntomas y hospital',
    kanji_icon: '体',
    color: '#e11d48',
    bg_gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u3-l1-cabeza-rostro',
        title: 'Cabeza y rostro',
        japanese_title: '頭・顔の部分',
        description: 'Facciones superiores, frente, mejillas y rasgos faciales',
        words: [
          { kanji: '頭', hiragana: 'あたま', meaning_es: 'Cabeza', level: 'N5' },
          { kanji: '顔', hiragana: 'かお', meaning_es: 'Cara / Rostro', level: 'N5' },
          { kanji: '額', hiragana: 'ひたい', meaning_es: 'Frente', level: 'N3' },
          { kanji: '眉', hiragana: 'まゆ', meaning_es: 'Ceja', level: 'N4' },
          { kanji: '頬', hiragana: 'ほほ', meaning_es: 'Mejilla', level: 'N3' },
          { kanji: '顎', hiragana: 'あご', meaning_es: 'Barbilla / Mandíbula', level: 'N3' },
          { kanji: '髭', hiragana: 'ひげ', meaning_es: 'Barba / Bigote', level: 'N4' },
          { kanji: '首', hiragana: 'くび', meaning_es: 'Cuello', level: 'N4' },
          { kanji: '喉', hiragana: 'のど', meaning_es: 'Garganta', level: 'N4' },
          { kanji: '耳', hiragana: 'みみ', meaning_es: 'Oreja / Oído', level: 'N5' },
          { kanji: 'こめかみ', hiragana: 'こめかみ', meaning_es: 'Sien', level: 'N3' },
          { kanji: '頭痛', hiragana: 'ずつう', meaning_es: 'Dolor de cabeza', level: 'N4' }
        ]
      },
      {
        id: 'u3-l2-ojos-orejas-boca',
        title: 'Ojos, nariz y boca',
        japanese_title: '目・鼻・口・歯',
        description: 'Órganos sensoriales faciales, labios y cavidad bucal',
        words: [
          { kanji: '目', hiragana: 'め', meaning_es: 'Ojo / Ojos', level: 'N5' },
          { kanji: '鼻', hiragana: 'はな', meaning_es: 'Nariz', level: 'N5' },
          { kanji: '口', hiragana: 'くち', meaning_es: 'Boca', level: 'N5' },
          { kanji: '唇', hiragana: 'くちびる', meaning_es: 'Labios', level: 'N3' },
          { kanji: '歯', hiragana: 'は', meaning_es: 'Diente / Dientes', level: 'N5' },
          { kanji: '舌', hiragana: 'した', meaning_es: 'Lengua', level: 'N3' },
          { kanji: '睫毛', hiragana: 'まつげ', meaning_es: 'Pestaña', level: 'N3' },
          { kanji: '瞳', hiragana: 'ひとみ', meaning_es: 'Pupila', level: 'N3' },
          { kanji: '涙', hiragana: 'なみだ', meaning_es: 'Lágrima', level: 'N4' },
          { kanji: '声', hiragana: 'こえ', meaning_es: 'Voz', level: 'N5' },
          { kanji: '歯茎', hiragana: 'はぐき', meaning_es: 'Encía', level: 'N3' }
        ]
      },
      {
        id: 'u3-l3-brazos-manos',
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
          { kanji: '拳', hiragana: 'こぶし', meaning_es: 'Puño', level: 'N3' },
          { kanji: '手の平', hiragana: 'てのひら', meaning_es: 'Palma de la mano', level: 'N3' },
          { kanji: '脇の下', hiragana: 'わきのした', meaning_es: 'Axila', level: 'N3' }
        ]
      },
      {
        id: 'u3-l4-piernas-pies-tronco',
        title: 'Piernas, pies y tronco',
        japanese_title: '足・脚・胴体',
        description: 'Extremidades inferiores, torso y postura',
        words: [
          { kanji: '足', hiragana: 'あし', meaning_es: 'Pie / Pierna', level: 'N5' },
          { kanji: '脚', hiragana: 'あし', meaning_es: 'Pierna (extremidad)', level: 'N5' },
          { kanji: '膝', hiragana: 'ひざ', meaning_es: 'Rodilla', level: 'N3' },
          { kanji: '足首', hiragana: 'あしくび', meaning_es: 'Tobillo', level: 'N4' },
          { kanji: '踵', hiragana: 'かかと', meaning_es: 'Talón', level: 'N3' },
          { kanji: 'つま先', hiragana: 'つまさき', meaning_es: 'Punta del pie', level: 'N3' },
          { kanji: '太もも', hiragana: 'ふともも', meaning_es: 'Muslo', level: 'N3' },
          { kanji: 'ふくらはぎ', hiragana: 'ふくらはぎ', meaning_es: 'Pantorrilla', level: 'N3' },
          { kanji: '脛', hiragana: 'すね', meaning_es: 'Espinilla', level: 'N3' },
          { kanji: '足の指', hiragana: 'あしのゆび', meaning_es: 'Dedo del pie', level: 'N4' },
          { kanji: '腰', hiragana: 'こし', meaning_es: 'Cintura / Cadera', level: 'N4' },
          { kanji: '尻', hiragana: 'しり', meaning_es: 'Glúteos / Trasero', level: 'N3' }
        ]
      },
      {
        id: 'u3-l5-organos-fisiologia',
        title: 'Órganos internos y fisiología',
        japanese_title: '内臓・血液・呼吸',
        description: 'Corazón, respiración, sangre, pulmón y musculatura',
        words: [
          { kanji: '胸', hiragana: 'むね', meaning_es: 'Pecho', level: 'N4' },
          { kanji: '背中', hiragana: 'せなか', meaning_es: 'Espalda', level: 'N4' },
          { kanji: '心臓', hiragana: 'しんぞう', meaning_es: 'Corazón (órgano anatómico)', level: 'N4' },
          { kanji: '胃', hiragana: 'い', meaning_es: 'Estómago (órgano interno)', level: 'N4' },
          { kanji: '肺', hiragana: 'はい', meaning_es: 'Pulmón', level: 'N3' },
          { kanji: '肝臓', hiragana: 'かんぞう', meaning_es: 'Hígado', level: 'N3' },
          { kanji: '腎臓', hiragana: 'じんぞう', meaning_es: 'Riñón', level: 'N3' },
          { kanji: '腸', hiragana: 'ちょう', meaning_es: 'Intestino', level: 'N3' },
          { kanji: '骨', hiragana: 'ほね', meaning_es: 'Hueso', level: 'N4' },
          { kanji: '筋肉', hiragana: 'きんにく', meaning_es: 'Músculo', level: 'N4' },
          { kanji: '血液', hiragana: 'けつえき', meaning_es: 'Sangre (término médico)', level: 'N4' },
          { kanji: '血管', hiragana: 'けっかん', meaning_es: 'Vaso sanguíneo', level: 'N3' },
          { kanji: '脳', hiragana: 'のう', meaning_es: 'Cerebro', level: 'N3' },
          { kanji: '体', hiragana: 'からだ', meaning_es: 'Cuerpo humano', level: 'N5' }
        ]
      },
      {
        id: 'u3-l6-sintomas-enfermedades',
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

  // -----------------------------------------------------------------------
  // UNIDAD 4: La Familia, la Vivienda y el Hogar
  // -----------------------------------------------------------------------
  {
    id: 'unit-4-familia-hogar',
    title: 'Unidad 4: La Familia, la Vivienda y el Hogar',
    japanese_title: '家族・住まい・日常生活',
    subtitle: 'Familiares, arquitectura doméstica, descanso, aseo, instalaciones y herramientas',
    kanji_icon: '家',
    color: '#f59e0b',
    bg_gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u4-l1-familia-inmediata',
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
          { kanji: '親', hiragana: 'おや', meaning_es: 'Padre o madre (progenitor)', level: 'N4' },
          { kanji: 'ご主人', hiragana: 'ごしゅじん', meaning_es: 'Esposo ajeno', level: 'N5' },
          { kanji: '奥さん', hiragana: 'おくさん', meaning_es: 'Esposa ajena', level: 'N5' }
        ]
      },
      {
        id: 'u4-l2-hermanos-abuelos',
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
          { kanji: '叔母', hiragana: 'おば', meaning_es: 'Tía', level: 'N4' },
          { kanji: '親戚', hiragana: 'しんせき', meaning_es: 'Parientes / Familiares', level: 'N3' },
          { kanji: '甥', hiragana: 'おい', meaning_es: 'Sobrino', level: 'N3' },
          { kanji: '従兄弟', hiragana: 'いとこ', meaning_es: 'Primo / Prima', level: 'N4' },
          { kanji: '孫', hiragana: 'まご', meaning_es: 'Nieto / Nieta', level: 'N4' }
        ]
      },
      {
        id: 'u4-l10-estructura-vivienda',
        title: 'Estructura y dependencias de la vivienda',
        japanese_title: '家の構造・建築',
        description: 'Tejados, paredes, techos, suelos, escaleras y elementos constructivos',
        words: [
          { kanji: '家', hiragana: 'いえ', meaning_es: 'Casa / Hogar', level: 'N5' },
          { kanji: '屋根', hiragana: 'やね', meaning_es: 'Tejado / Techo exterior', level: 'N4' },
          { kanji: '天井', hiragana: 'てんじょう', meaning_es: 'Techo interior / Raso', level: 'N4' },
          { kanji: '床', hiragana: 'ゆか', meaning_es: 'Suelo / Piso', level: 'N4' },
          { kanji: '柱', hiragana: 'はしら', meaning_es: 'Pilar / Columna', level: 'N3' },
          { kanji: '壁', hiragana: 'かべ', meaning_es: 'Pared / Muro', level: 'N4' },
          { kanji: '玄関', hiragana: 'げんかん', meaning_es: 'Entrada principal / Recibidor', level: 'N5' },
          { kanji: '廊下', hiragana: 'ろうか', meaning_es: 'Pasillo', level: 'N4' },
          { kanji: '階段', hiragana: 'かいだん', meaning_es: 'Escaleras', level: 'N5' },
          { kanji: '窓', hiragana: 'まど', meaning_es: 'Ventana', level: 'N5' },
          { kanji: 'ドア', hiragana: 'どあ', meaning_es: 'Puerta', level: 'N5' },
          { kanji: '基礎', hiragana: 'きそ', meaning_es: 'Cimientos / Base estructural', level: 'N3' },
          { kanji: 'ベランダ', hiragana: 'べらんだ', meaning_es: 'Balcón / Terraza', level: 'N4' },
          { kanji: '塀', hiragana: 'へい', meaning_es: 'Valla / Cerca / Muro perimetral', level: 'N3' },
          { kanji: '瓦', hiragana: 'かわら', meaning_es: 'Teja de tejado', level: 'N3' },
          { kanji: '部屋', hiragana: 'へや', meaning_es: 'Habitación / Cuarto', level: 'N5' },
          { kanji: '門', hiragana: 'もん', meaning_es: 'Puerta exterior / Portalón', level: 'N5' },
          { kanji: '畳', hiragana: 'たたみ', meaning_es: 'Esterilla de tatami tradicional', level: 'N4' },
          { kanji: '障子', hiragana: 'しょうじ', meaning_es: 'Puerta corredera de papel shoji', level: 'N3' },
          { kanji: '襖', hiragana: 'ふすま', meaning_es: 'Puerta corredera opaca fusuma', level: 'N3' },
          { kanji: '鍵', hiragana: 'かぎ', meaning_es: 'Llave / Cerradura', level: 'N5' },
          { kanji: 'チャイム', hiragana: 'ちゃいむ', meaning_es: 'Timbre de la puerta', level: 'N4' }
        ]
      },
      {
        id: 'u4-l11-salon-estar',
        title: 'Sala de estar y salón',
        japanese_title: '居間・リビング',
        description: 'Mobiliario, sofás, entretenimiento y confort del salón',
        words: [
          { kanji: 'ソファ', hiragana: 'そふぁ', meaning_es: 'Sofá', level: 'N5' },
          { kanji: 'リビング', hiragana: 'りびんぐ', meaning_es: 'Sala de estar / Living room', level: 'N5' },
          { kanji: '居間', hiragana: 'いま', meaning_es: 'Sala de estar / Cuarto de estar', level: 'N4' },
          { kanji: 'カーペット', hiragana: 'かーぺっと', meaning_es: 'Alfombra / Moqueta', level: 'N4' },
          { kanji: '絨毯', hiragana: 'じゅうたん', meaning_es: 'Tapiz / Alfombra gruesa', level: 'N3' },
          { kanji: 'テーブル', hiragana: 'てーぶる', meaning_es: 'Mesa de centro', level: 'N5' },
          { kanji: 'テレビ', hiragana: 'てれび', meaning_es: 'Televisión', level: 'N5' },
          { kanji: 'リモコン', hiragana: 'りもこん', meaning_es: 'Mando a distancia', level: 'N4' },
          { kanji: '本棚', hiragana: 'ほんだな', meaning_es: 'Estantería de libros', level: 'N5' },
          { kanji: 'クッション', hiragana: 'くっしょん', meaning_es: 'Cojín decorativo', level: 'N4' },
          { kanji: '壁掛け時計', hiragana: 'かべかけとけい', meaning_es: 'Reloj de pared', level: 'N4' },
          { kanji: 'カーテン', hiragana: 'かーてん', meaning_es: 'Cortina', level: 'N4' },
          { kanji: '照明', hiragana: 'しょうめい', meaning_es: 'Iluminación / Lámpara de techo', level: 'N3' },
          { kanji: 'エアコン', hiragana: 'えあこん', meaning_es: 'Aire acondicionado', level: 'N5' },
          { kanji: '扇風機', hiragana: 'せんぷうき', meaning_es: 'Ventilador eléctrico', level: 'N4' },
          { kanji: '花瓶', hiragana: 'かびん', meaning_es: 'Jarrón / Florero', level: 'N4' },
          { kanji: '座布団', hiragana: 'ざぶとん', meaning_es: 'Cojín japonés para el suelo', level: 'N4' }
        ]
      },
      {
        id: 'u4-l12-dormitorio-descanso',
        title: 'Dormitorio y descanso',
        japanese_title: '寝室・ベッドルーム',
        description: 'Cama, almohadas, sábanas, armarios y descanso nocturno',
        words: [
          { kanji: 'ベッド', hiragana: 'べっど', meaning_es: 'Cama occidental', level: 'N5' },
          { kanji: '枕', hiragana: 'まくら', meaning_es: 'Almohada', level: 'N4' },
          { kanji: '布団', hiragana: 'ふとん', meaning_es: 'Futón japonés', level: 'N4' },
          { kanji: '毛布', hiragana: 'もうふ', meaning_es: 'Manta', level: 'N4' },
          { kanji: 'シーツ', hiragana: 'しーつ', meaning_es: 'Sábana', level: 'N4' },
          { kanji: '押入れ', hiragana: 'おしいれ', meaning_es: 'Armario empotrado tradicional', level: 'N4' },
          { kanji: 'クローゼット', hiragana: 'くろーぜっと', meaning_es: 'Armario ropero', level: 'N4' },
          { kanji: '目覚まし時計', hiragana: 'めざましどけい', meaning_es: 'Reloj despertador', level: 'N4' },
          { kanji: 'ナイトテーブル', hiragana: 'ないとてーぶる', meaning_es: 'Mesita de noche', level: 'N4' },
          { kanji: 'マットレス', hiragana: 'まっとれす', meaning_es: 'Colchón', level: 'N4' },
          { kanji: '敷布団', hiragana: 'しきぶとん', meaning_es: 'Colchón de futón', level: 'N4' },
          { kanji: '掛布団', hiragana: 'かけぶとん', meaning_es: 'Edredón de futón', level: 'N4' },
          { kanji: '読書灯', hiragana: 'どくしょとう', meaning_es: 'Lámpara de lectura', level: 'N3' },
          { kanji: 'ハンガー', hiragana: 'はんがー', meaning_es: 'Percha de ropa', level: 'N4' },
          { kanji: '寝巻き', hiragana: 'ねまき', meaning_es: 'Ropa de dormir tradicional', level: 'N3' }
        ]
      },
      {
        id: 'u4-l13-bano-aseo',
        title: 'Cuarto de baño y aseo personal',
        japanese_title: '浴室・洗面所・トイレタリー',
        description: 'Bañera, ducha, jabón, cepillo dental, toallas y aseo diario',
        words: [
          { kanji: 'トイレ', hiragana: 'といれ', meaning_es: 'Inodoro / Retrete', level: 'N5' },
          { kanji: '風呂', hiragana: 'ふろ', meaning_es: 'Bañera / Baño japonés', level: 'N5' },
          { kanji: '風呂場', hiragana: 'ふろば', meaning_es: 'Cuarto de baño (espacio)', level: 'N4' },
          { kanji: 'シャワー', hiragana: 'しゃわー', meaning_es: 'Ducha', level: 'N5' },
          { kanji: '洗面台', hiragana: 'せんめんだい', meaning_es: 'Lavabo / Tocador', level: 'N4' },
          { kanji: 'タオル', hiragana: 'たおる', meaning_es: 'Toalla', level: 'N5' },
          { kanji: '石鹸', hiragana: 'せっけん', meaning_es: 'Jabón de manos / cuerpo', level: 'N5' },
          { kanji: 'リンス', hiragana: 'りんす', meaning_es: 'Acondicionador de pelo', level: 'N4' },
          { kanji: '歯ブラシ', hiragana: 'はぶらし', meaning_es: 'Cepillo de dientes', level: 'N4' },
          { kanji: '歯磨き粉', hiragana: 'はみがきこ', meaning_es: 'Pasta dentífrica', level: 'N4' },
          { kanji: '剃刀', hiragana: 'かみそり', meaning_es: 'Maquinilla de afeitar', level: 'N4' },
          { kanji: '鏡', hiragana: 'かがみ', meaning_es: 'Espejo', level: 'N4' },
          { kanji: 'バスマット', hiragana: 'ばすまっと', meaning_es: 'Alfombrilla de baño', level: 'N4' },
          { kanji: '湯船', hiragana: 'ゆぶね', meaning_es: 'Tina / Bañera con agua caliente', level: 'N3' },
          { kanji: 'トイレットペーパー', hiragana: 'といれっとぺーぱー', meaning_es: 'Papel higiénico', level: 'N4' },
          { kanji: 'ドライヤー', hiragana: 'どらいやー', meaning_es: 'Secador de pelo', level: 'N4' },
          { kanji: 'ボディソープ', hiragana: 'ぼでぃそーぷ', meaning_es: 'Gel de baño líquido', level: 'N4' },
          { kanji: '洗面器', hiragana: 'せんめんき', meaning_es: 'Palangana de baño', level: 'N3' },
          { kanji: '給湯器', hiragana: 'きゅうとうき', meaning_es: 'Calentador de agua', level: 'N3' }
        ]
      },
      {
        id: 'u4-l14-instalaciones-hogar',
        title: 'Instalaciones y suministros del hogar',
        japanese_title: '住宅設備・ライフライン',
        description: 'Luz, agua, gas, calefacción, enchufes y conexiones domésticas',
        words: [
          { kanji: '電気', hiragana: 'でんき', meaning_es: 'Electricidad', level: 'N5' },
          { kanji: '水道', hiragana: 'すいどう', meaning_es: 'Suministro de agua potable', level: 'N5' },
          { kanji: 'ガス', hiragana: 'がす', meaning_es: 'Gas doméstico', level: 'N5' },
          { kanji: '暖房', hiragana: 'だんぼう', meaning_es: 'Calefacción', level: 'N4' },
          { kanji: '冷房', hiragana: 'れいぼう', meaning_es: 'Refrigeración / Aire frío', level: 'N4' },
          { kanji: '給湯', hiragana: 'きゅうとう', meaning_es: 'Suministro de agua caliente', level: 'N3' },
          { kanji: 'コンセント', hiragana: 'こんせんと', meaning_es: 'Enchufe de pared / Tomacorriente', level: 'N4' },
          { kanji: 'スイッチ', hiragana: 'すいっち', meaning_es: 'Interruptor de luz', level: 'N4' },
          { kanji: 'ブレーカー', hiragana: 'ぶれーかー', meaning_es: 'Cuadro de disyuntores eléctricos', level: 'N3' },
          { kanji: 'インターネット', hiragana: 'いんたーねっと', meaning_es: 'Conexión de internet', level: 'N5' },
          { kanji: '配管', hiragana: 'はいかん', meaning_es: 'Fontanería / Tuberías', level: 'N3' },
          { kanji: 'メーター', hiragana: 'めーたー', meaning_es: 'Contador de suministros (gas/luz/agua)', level: 'N4' },
          { kanji: '通信', hiragana: 'つうしん', meaning_es: 'Telecomunicaciones', level: 'N3' }
        ]
      },
      {
        id: 'u4-l15-lavanderia-ropa',
        title: 'Lavandería y cuidado de ropa',
        japanese_title: '洗濯・衣類ケア',
        description: 'Lavadora, secadora, tender la ropa, planchado y doblado',
        words: [
          { kanji: '洗濯機', hiragana: 'せんたくき', meaning_es: 'Lavadora', level: 'N4' },
          { kanji: '乾燥機', hiragana: 'かんそうき', meaning_es: 'Secadora de ropa', level: 'N4' },
          { kanji: '洗剤', hiragana: 'せんざい', meaning_es: 'Detergente para ropa', level: 'N4' },
          { kanji: '柔軟剤', hiragana: 'じゅうなんざい', meaning_es: 'Suavizante textil', level: 'N3' },
          { kanji: '洗濯物', hiragana: 'せんたくもの', meaning_es: 'Ropa para lavar / Colada', level: 'N4' },
          { kanji: '干す', hiragana: 'ほす', meaning_es: 'Tender la colada al sol', level: 'N4' },
          { kanji: '畳む', hiragana: 'たたむ', meaning_es: 'Doblar la ropa', level: 'N4' },
          { kanji: 'アイロン', hiragana: 'あいろん', meaning_es: 'Plancha de ropa', level: 'N4' },
          { kanji: '物干し竿', hiragana: 'ものほしざお', meaning_es: 'Barra para colgar la colada', level: 'N3' },
          { kanji: '洗濯ばさみ', hiragana: 'せんたくばさみ', meaning_es: 'Pinzas para la ropa', level: 'N4' },
          { kanji: '洗濯かご', hiragana: 'せんたくかご', meaning_es: 'Cesto de la ropa', level: 'N4' },
          { kanji: '漂白剤', hiragana: 'ひょうはくざい', meaning_es: 'Lejía / Blanqueador textil', level: 'N3' }
        ]
      },
      {
        id: 'u4-l16-equipos-limpieza',
        title: 'Equipos y útiles de limpieza',
        japanese_title: '清掃用品・用具',
        description: 'Aspiradora, escoba, recogedor, bayetas, fregonas y cubos',
        words: [
          { kanji: '掃除機', hiragana: 'そうじき', meaning_es: 'Aspiradora', level: 'N4' },
          { kanji: '箒', hiragana: 'ほうき', meaning_es: 'Escoba', level: 'N4' },
          { kanji: '塵取り', hiragana: 'ちりとり', meaning_es: 'Recogedor de basura', level: 'N4' },
          { kanji: 'モップ', hiragana: 'もっぷ', meaning_es: 'Mopa / Fregona', level: 'N4' },
          { kanji: 'バケツ', hiragana: 'ばけつ', meaning_es: 'Cubo de fregar', level: 'N4' },
          { kanji: '雑巾', hiragana: 'ぞうきん', meaning_es: 'Bayeta / Paño de limpieza', level: 'N4' },
          { kanji: 'ハタキ', hiragana: 'はたき', meaning_es: 'Plumero para polvo', level: 'N4' },
          { kanji: 'デッキブラシ', hiragana: 'でっきぶらし', meaning_es: 'Cepillo de fregar suelos', level: 'N3' },
          { kanji: 'スポンジ', hiragana: 'すぽんじ', meaning_es: 'Esponja para fregar', level: 'N4' },
          { kanji: '掃除用洗剤', hiragana: 'そうじようせんざい', meaning_es: 'Producto de limpieza del hogar', level: 'N4' },
          { kanji: 'ゴミ袋', hiragana: 'ごみぶくろ', meaning_es: 'Bolsa de basura', level: 'N4' },
          { kanji: 'ゴミ箱', hiragana: 'ごみばこ', meaning_es: 'Cubo / Papelera', level: 'N5' },
          { kanji: 'ワックス', hiragana: 'わっくす', meaning_es: 'Cera protectora para suelos', level: 'N4' }
        ]
      },
      {
        id: 'u4-l17-jardin-patio',
        title: 'Jardín y patio exterior',
        japanese_title: '庭・園芸・屋外',
        description: 'Plantas, césped, mangueras, regaderas, poda y herramientas verdes',
        words: [
          { kanji: '庭', hiragana: 'にわ', meaning_es: 'Jardín', level: 'N5' },
          { kanji: '芝生', hiragana: 'しばふ', meaning_es: 'Césped', level: 'N3' },
          { kanji: '花壇', hiragana: 'かだん', meaning_es: 'Arriate / Cantero de flores', level: 'N3' },
          { kanji: '植木', hiragana: 'うえき', meaning_es: 'Planta de jardín / Arbusto', level: 'N4' },
          { kanji: 'じょうろ', hiragana: 'じょうろ', meaning_es: 'Regadera de plantas', level: 'N4' },
          { kanji: 'ホース', hiragana: 'ほーす', meaning_es: 'Manguera de agua', level: 'N4' },
          { kanji: '剪定ばさみ', hiragana: 'せんていばさみ', meaning_es: 'Tijeras de podar', level: 'N3' },
          { kanji: '植木鉢', hiragana: 'うえきばち', meaning_es: 'Maceta para plantas', level: 'N4' },
          { kanji: '土', hiragana: 'つち', meaning_es: 'Tierra / Sustrato vegetal', level: 'N5' },
          { kanji: '肥料', hiragana: 'ひりょう', meaning_es: 'Fertilizante / Abono', level: 'N3' },
          { kanji: '雑草', hiragana: 'ざっそう', meaning_es: 'Malas hierbas', level: 'N3' },
          { kanji: '垣根', hiragana: 'かきね', meaning_es: 'Seto / Cerca viva', level: 'N3' },
          { kanji: 'フェンス', hiragana: 'ふぇんす', meaning_es: 'Valla metálica', level: 'N4' },
          { kanji: '庭石', hiragana: 'にわいし', meaning_es: 'Piedra decorativa de jardín japonés', level: 'N3' }
        ]
      },
      {
        id: 'u4-l18-herramientas-bricolaje',
        title: 'Herramientas y taller de bricolaje',
        japanese_title: '工具・DIY・ワークショップ',
        description: 'Martillo, destornillador, sierra, clavos, tornillos y reparaciones',
        words: [
          { kanji: '金槌', hiragana: 'かなづち', meaning_es: 'Martillo', level: 'N4' },
          { kanji: 'ハンマー', hiragana: 'はんまー', meaning_es: 'Martillo de obra', level: 'N4' },
          { kanji: 'ドライバー', hiragana: 'どらいばー', meaning_es: 'Destornillador', level: 'N4' },
          { kanji: '鋸', hiragana: 'のこぎり', meaning_es: 'Sierra para cortar madera', level: 'N4' },
          { kanji: 'ペンチ', hiragana: 'ぺんち', meaning_es: 'Alicates', level: 'N4' },
          { kanji: '釘', hiragana: 'くぎ', meaning_es: 'Clavo', level: 'N4' },
          { kanji: 'ねじ', hiragana: 'ねじ', meaning_es: 'Tornillo', level: 'N4' },
          { kanji: 'ナット', hiragana: 'なっと', meaning_es: 'Tuerca', level: 'N4' },
          { kanji: 'ボルト', hiragana: 'ぼると', meaning_es: 'Perno / Tornillo pasante', level: 'N4' },
          { kanji: 'メジャー', hiragana: 'めじゃー', meaning_es: 'Cinta métrica', level: 'N4' },
          { kanji: 'スパナ', hiragana: 'すぱな', meaning_es: 'Llave fija inglesa', level: 'N4' },
          { kanji: '道具箱', hiragana: 'どうぐばこ', meaning_es: 'Caja de herramientas', level: 'N4' },
          { kanji: 'やすり', hiragana: 'やすり', meaning_es: 'Lima de metal / lija', level: 'N3' },
          { kanji: '接着剤', hiragana: 'せっちゃくざい', meaning_es: 'Adhesivo / Pegamento', level: 'N3' }
        ]
      },
      {
        id: 'u4-l19-bebe-cuidado',
        title: 'Bebé y puericultura',
        japanese_title: '赤ちゃん・育児用品',
        description: 'Cuna, cochecito, pañales, biberones y cuidados de los más pequeños',
        words: [
          { kanji: '赤ちゃん', hiragana: 'あかちゃん', meaning_es: 'Bebé', level: 'N5' },
          { kanji: 'ベビーベッド', hiragana: 'べびーべっど', meaning_es: 'Cuna de bebé', level: 'N4' },
          { kanji: 'ベビーカー', hiragana: 'べびーかー', meaning_es: 'Cochecito de paseo', level: 'N4' },
          { kanji: 'おむつ', hiragana: 'おむつ', meaning_es: 'Pañal', level: 'N4' },
          { kanji: '哺乳瓶', hiragana: 'ほにゅうびん', meaning_es: 'Biberón', level: 'N3' },
          { kanji: 'おしゃぶり', hiragana: 'おしゃぶり', meaning_es: 'Chupete', level: 'N4' },
          { kanji: 'よだれかけ', hiragana: 'よだれかけ', meaning_es: 'Babero', level: 'N4' },
          { kanji: 'がらがら', hiragana: 'がらがら', meaning_es: 'Sonajero', level: 'N4' },
          { kanji: '抱っこ紐', hiragana: 'だっこひも', meaning_es: 'Portabebés', level: 'N3' },
          { kanji: '離乳食', hiragana: 'りにゅうしょく', meaning_es: 'Comida para destete / Papilla', level: 'N3' },
          { kanji: '粉ミルク', hiragana: 'こなみるく', meaning_es: 'Leche de fórmula en polvo', level: 'N4' }
        ]
      },
      {
        id: 'u4-l8-rutina-diaria',
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

  // -----------------------------------------------------------------------
  // UNIDAD 5: Moda, Accesorios, Calzado y Cuidado Personal
  // -----------------------------------------------------------------------
  {
    id: 'unit-5-moda-cuidado',
    title: 'Unidad 5: Moda, Accesorios, Calzado y Cuidado Personal',
    japanese_title: '服装・装身具・美容・ヘアケア',
    subtitle: 'Ropa, prendas de temporada, joyas, complementos, calzado, peluquería y cosméticos',
    kanji_icon: '装',
    color: '#ec4899',
    bg_gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u4-l6-ropa-prendas',
        title: 'Ropa y prendas de vestir',
        japanese_title: '衣服・着るもの',
        description: 'Prendas superiores, pantalones, vestidos y abrigos',
        words: [
          { kanji: '服', hiragana: 'ふく', meaning_es: 'Ropa / Prenda', level: 'N5' },
          { kanji: 'シャツ', hiragana: 'しゃつ', meaning_es: 'Camisa', level: 'N5' },
          { kanji: 'Tシャツ', hiragana: 'てぃーしゃつ', meaning_es: 'Camiseta', level: 'N5' },
          { kanji: 'ズボン', hiragana: 'ずぼん', meaning_es: 'Pantalones', level: 'N5' },
          { kanji: 'スカート', hiragana: 'すかーと', meaning_es: 'Falda', level: 'N5' },
          { kanji: 'ワンピース', hiragana: 'わんぴーす', meaning_es: 'Vestido enterizo', level: 'N4' },
          { kanji: 'ジャケット', hiragana: 'じゃけっと', meaning_es: 'Chaqueta', level: 'N5' },
          { kanji: 'コート', hiragana: 'こーと', meaning_es: 'Abrigo', level: 'N5' },
          { kanji: 'セーター', hiragana: 'せーたー', meaning_es: 'Suéter / Jersey', level: 'N5' },
          { kanji: 'スーツ', hiragana: 'すーつ', meaning_es: 'Traje formal de chaqueta', level: 'N4' },
          { kanji: 'パジャマ', hiragana: 'ぱじゃま', meaning_es: 'Pijama', level: 'N5' },
          { kanji: '下着', hiragana: 'したぎ', meaning_es: 'Ropa interior', level: 'N4' },
          { kanji: '着物', hiragana: 'きもの', meaning_es: 'Kimono tradicional', level: 'N4' },
          { kanji: 'ポケット', hiragana: 'ぽけっと', meaning_es: 'Bolsillo', level: 'N5' },
          { kanji: 'ボタン', hiragana: 'ぼたん', meaning_es: 'Botón', level: 'N5' },
          { kanji: 'ファスナー', hiragana: 'ふぁすなー', meaning_es: 'Cremallera', level: 'N4' },
          { kanji: '和服', hiragana: 'わふく', meaning_es: 'Ropa japonesa tradicional', level: 'N3' }
        ]
      },
      {
        id: 'u4-l20-accesorios-vestir',
        title: 'Accesorios de vestir y moda',
        japanese_title: 'アクセサリー・装身具',
        description: 'Cinturones, corbatas, bufandas, guantes, anillos y joyas',
        words: [
          { kanji: 'ベルト', hiragana: 'べると', meaning_es: 'Cinturón', level: 'N5' },
          { kanji: 'ネクタイ', hiragana: 'ねくたい', meaning_es: 'Corbata', level: 'N5' },
          { kanji: 'マフラー', hiragana: 'まふらー', meaning_es: 'Bufanda de abrigo', level: 'N4' },
          { kanji: '手袋', hiragana: 'てぶくろ', meaning_es: 'Guantes', level: 'N5' },
          { kanji: '帽子', hiragana: 'ぼうし', meaning_es: 'Sombrero / Gorra', level: 'N5' },
          { kanji: '腕時計', hiragana: 'うでどけい', meaning_es: 'Reloj de pulsera', level: 'N4' },
          { kanji: '傘', hiragana: 'かさ', meaning_es: 'Paraguas', level: 'N5' },
          { kanji: '指輪', hiragana: 'ゆびわ', meaning_es: 'Anillo', level: 'N4' },
          { kanji: 'ネックレス', hiragana: 'ねっくれす', meaning_es: 'Collar', level: 'N4' },
          { kanji: 'ピアス', hiragana: 'ぴあす', meaning_es: 'Pendientes con agujero', level: 'N4' },
          { kanji: 'イヤリング', hiragana: 'いやりんぐ', meaning_es: 'Pendientes de clip', level: 'N4' },
          { kanji: 'サングラス', hiragana: 'さんぐらす', meaning_es: 'Gafas de sol', level: 'N4' },
          { kanji: 'ハンカチ', hiragana: 'はんかち', meaning_es: 'Pañuelo de bolsillo', level: 'N5' },
          { kanji: '財布', hiragana: 'さいふ', meaning_es: 'Cartera / Billetera', level: 'N5' }
        ]
      },
      {
        id: 'u4-l21-calzado-bolsos',
        title: 'Calzado y bolsos',
        japanese_title: '靴・鞄・バッグ類',
        description: 'Zapatos, zapatillas, botas, mochilas y maletas de viaje',
        words: [
          { kanji: '靴', hiragana: 'くつ', meaning_es: 'Zapatos / Calzado', level: 'N5' },
          { kanji: 'スニーカー', hiragana: 'すにーかー', meaning_es: 'Zapatillas de deporte', level: 'N5' },
          { kanji: '革靴', hiragana: 'かわぐつ', meaning_es: 'Zapatos de cuero de vestir', level: 'N4' },
          { kanji: 'ブーツ', hiragana: 'ぶーつ', meaning_es: 'Botas', level: 'N4' },
          { kanji: 'サンダル', hiragana: 'さんだる', meaning_es: 'Sandalias', level: 'N4' },
          { kanji: 'ハイヒール', hiragana: 'はいひーる', meaning_es: 'Zapatos de tacón alto', level: 'N4' },
          { kanji: 'スリッパ', hiragana: 'すりっぱ', meaning_es: 'Zapatillas de casa', level: 'N5' },
          { kanji: '鞄', hiragana: 'かばん', meaning_es: 'Bolso / Maletín', level: 'N5' },
          { kanji: 'リュック', hiragana: 'りゅっく', meaning_es: 'Mochila', level: 'N4' },
          { kanji: 'ハンドバッグ', hiragana: 'はんどばっぐ', meaning_es: 'Bolso de mano', level: 'N4' },
          { kanji: 'スーツケース', hiragana: 'すーつけーす', meaning_es: 'Maleta de viaje', level: 'N4' },
          { kanji: 'エコバッグ', hiragana: 'えこばっぐ', meaning_es: 'Bolsa reutilizable de la compra', level: 'N4' },
          { kanji: 'ポーチ', hiragana: 'ぽーち', meaning_es: 'Neceser / Bolsa pequeña', level: 'N4' }
        ]
      },
      {
        id: 'u4-l22-cabello-peinados',
        title: 'Cabello y peinados',
        japanese_title: '髪・ヘアスタイル・散髪',
        description: 'Cortes de pelo, estilos, peinado, cepillos y cuidado capilar',
        words: [
          { kanji: '髪', hiragana: 'かみ', meaning_es: 'Cabello / Pelo', level: 'N5' },
          { kanji: '短髪', hiragana: 'たんぱつ', meaning_es: 'Pelo corto', level: 'N3' },
          { kanji: '長髪', hiragana: 'ちょうはつ', meaning_es: 'Pelo largo', level: 'N3' },
          { kanji: '前髪', hiragana: 'まえがみ', meaning_es: 'Flequillo', level: 'N4' },
          { kanji: 'パーマ', hiragana: 'ぱーま', meaning_es: 'Permanente / Pelo ondulado', level: 'N4' },
          { kanji: '散髪', hiragana: 'さんぱつ', meaning_es: 'Corte de pelo', level: 'N4' },
          { kanji: '染める', hiragana: 'そめる', meaning_es: 'Teñir el cabello', level: 'N3' },
          { kanji: '櫛', hiragana: 'くし', meaning_es: 'Peine', level: 'N4' },
          { kanji: 'ブラシ', hiragana: 'ぶらし', meaning_es: 'Cepillo para el pelo', level: 'N4' },
          { kanji: 'ヘアドライヤー', hiragana: 'へあどらいやー', meaning_es: 'Secador de pelo', level: 'N4' },
          { kanji: 'シャンプー', hiragana: 'しゃんぷー', meaning_es: 'Lavado de cabeza / Champú', level: 'N5' },
          { kanji: '結ぶ', hiragana: 'むすぶ', meaning_es: 'Recogerse / Atarse el pelo', level: 'N4' },
          { kanji: 'ポニーテール', hiragana: 'ぽにーてーる', meaning_es: 'Coleta de caballo', level: 'N4' },
          { kanji: '三つ編み', hiragana: 'みつあみ', meaning_es: 'Trenza', level: 'N3' },
          { kanji: '白髪', hiragana: 'しらが', meaning_es: 'Canas / Pelo blanco', level: 'N3' },
          { kanji: 'つむじ', hiragana: 'つむじ', meaning_es: 'Remolino del cabello', level: 'N3' }
        ]
      },
      {
        id: 'u4-l23-belleza-maquillaje',
        title: 'Belleza, cosmética y maquillaje',
        japanese_title: '美容・化粧・メイク用品',
        description: 'Cosméticos, hidratación facial, barras labiales y cuidado de la piel',
        words: [
          { kanji: '化粧', hiragana: 'けしょう', meaning_es: 'Maquillaje', level: 'N4' },
          { kanji: '口紅', hiragana: 'くちべに', meaning_es: 'Pintalabios / Lápiz labial', level: 'N4' },
          { kanji: 'リップ', hiragana: 'リップ', meaning_es: 'Bálsamo labial', level: 'N4' },
          { kanji: 'ファンデーション', hiragana: 'ふぁんでーしょん', meaning_es: 'Base de maquillaje', level: 'N4' },
          { kanji: 'アイシャドウ', hiragana: 'あいしゃどう', meaning_es: 'Sombra de ojos', level: 'N4' },
          { kanji: 'マスカラ', hiragana: 'ますから', meaning_es: 'Máscara de pestañas', level: 'N4' },
          { kanji: 'チーク', hiragana: 'ちーく', meaning_es: 'Colorete / Rubor', level: 'N4' },
          { kanji: '化粧水', hiragana: 'けしょうすい', meaning_es: 'Loción facial hidratante / Tónico', level: 'N3' },
          { kanji: '乳液', hiragana: 'にゅうえき', meaning_es: 'Emulsión hidratante facial', level: 'N3' },
          { kanji: '美容液', hiragana: 'びようえき', meaning_es: 'Sérum de belleza facial', level: 'N3' },
          { kanji: 'クレンジング', hiragana: 'くれんじんぐ', meaning_es: 'Desmaquillante', level: 'N4' },
          { kanji: '日焼け止め', hiragana: 'ひやけどめ', meaning_es: 'Protector solar', level: 'N4' },
          { kanji: '香水', hiragana: 'こうすい', meaning_es: 'Perfume', level: 'N4' },
          { kanji: 'マニキュア', hiragana: 'まにきゅあ', meaning_es: 'Esmalte de uñas', level: 'N4' },
          { kanji: '眉墨', hiragana: 'まゆずみ', meaning_es: 'Lápiz de cejas', level: 'N3' }
        ]
      }
    ]
  },

  // -----------------------------------------------------------------------
  // UNIDAD 6: Cocina, Menaje y Gastronomía Japonesa
  // -----------------------------------------------------------------------
  {
    id: 'unit-6-comida-gastronomia',
    title: 'Unidad 6: Cocina, Menaje y Gastronomía Japonesa',
    japanese_title: '飲食・日本料理・味覚',
    subtitle: 'Mesa, vajilla, electrodomésticos, técnicas culinarias, alimentos tradicionales y restaurantes',
    kanji_icon: '食',
    color: '#10b981',
    bg_gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u5-l10-comedor-mesa',
        title: 'Comedor y mesa',
        japanese_title: '食卓・ダイニング・配膳',
        description: 'Mesa de comedor, manteles, servilletas, posavasos y aliños',
        words: [
          { kanji: 'ダイニング', hiragana: 'だいにんぐ', meaning_es: 'Comedor', level: 'N5' },
          { kanji: '食堂', hiragana: 'しょくどう', meaning_es: 'Comedor / Sala para comer', level: 'N5' },
          { kanji: '食卓', hiragana: 'しょくたく', meaning_es: 'Mesa de comedor', level: 'N4' },
          { kanji: '椅子', hiragana: 'いす', meaning_es: 'Silla', level: 'N5' },
          { kanji: 'テーブルクロス', hiragana: 'てーぶるくろす', meaning_es: 'Mantel', level: 'N4' },
          { kanji: 'ナプキン', hiragana: 'なぷきん', meaning_es: 'Servilleta', level: 'N4' },
          { kanji: 'コースター', hiragana: 'こーすたー', meaning_es: 'Posavasos', level: 'N4' },
          { kanji: 'つまようじ', hiragana: 'つまようじ', meaning_es: 'Palillo de dientes', level: 'N4' },
          { kanji: '調味料入れ', hiragana: 'ちょうみりょういれ', meaning_es: 'Especiero', level: 'N4' },
          { kanji: '塩入れ', hiragana: 'しおいれ', meaning_es: 'Salero', level: 'N4' },
          { kanji: '胡椒入れ', hiragana: 'こしょういれ', meaning_es: 'Pimentero', level: 'N4' },
          { kanji: '醤油差し', hiragana: 'しょうゆさし', meaning_es: 'Recipiente dosificador de soja', level: 'N4' },
          { kanji: '箸置き', hiragana: 'はしおき', meaning_es: 'Soporte para palillos', level: 'N4' },
          { kanji: 'トレイ', hiragana: 'とれい', meaning_es: 'Bandeja de servir', level: 'N4' },
          { kanji: '席', hiragana: 'せき', meaning_es: 'Asiento / Lugar en la mesa', level: 'N4' }
        ]
      },
      {
        id: 'u5-l11-vajilla-cubiertos',
        title: 'Vajilla y cubiertos',
        japanese_title: '食器・カトラリー',
        description: 'Platos, cuencos de arroz, palillos, cucharas, tenedores, cuchillos y tazas',
        words: [
          { kanji: '皿', hiragana: 'さら', meaning_es: 'Plato', level: 'N5' },
          { kanji: '茶碗', hiragana: 'ちゃわん', meaning_es: 'Cuenco para arroz', level: 'N5' },
          { kanji: '椀', hiragana: 'わん', meaning_es: 'Cuenco para sopa de miso', level: 'N4' },
          { kanji: '箸', hiragana: 'はし', meaning_es: 'Palillos', level: 'N5' },
          { kanji: 'スプーン', hiragana: 'すぷーん', meaning_es: 'Cuchara', level: 'N5' },
          { kanji: 'フォーク', hiragana: 'ふぉーく', meaning_es: 'Tenedor', level: 'N5' },
          { kanji: 'ナイフ', hiragana: 'ないふ', meaning_es: 'Cuchillo de mesa', level: 'N5' },
          { kanji: 'コップ', hiragana: 'こっぷ', meaning_es: 'Vaso', level: 'N5' },
          { kanji: 'グラス', hiragana: 'ぐらす', meaning_es: 'Copa / Vaso de cristal', level: 'N4' },
          { kanji: '湯呑み', hiragana: 'ゆのみ', meaning_es: 'Taza japonesa de té verde', level: 'N4' },
          { kanji: 'マグカップ', hiragana: 'まぐかっぷ', meaning_es: 'Taza grande / Mug', level: 'N4' },
          { kanji: '急須', hiragana: 'きゅうす', meaning_es: 'Tetera tradicional japonesa', level: 'N3' },
          { kanji: '丼', hiragana: 'どんぶり', meaning_es: 'Cuenco grande para donburi', level: 'N4' },
          { kanji: '大皿', hiragana: 'おおざら', meaning_es: 'Fuente grande para compartir', level: 'N4' },
          { kanji: '小皿', hiragana: 'こざら', meaning_es: 'Platillo pequeño para salsas', level: 'N4' }
        ]
      },
      {
        id: 'u5-l12-cocina-espacio',
        title: 'La cocina: espacio y mobiliario',
        japanese_title: '台所設備・シンク・収納',
        description: 'Fregadero, grifos, encimeras, campanas extractoras y alacenas',
        words: [
          { kanji: '台所', hiragana: 'だいどころ', meaning_es: 'Cocina', level: 'N5' },
          { kanji: 'キッチン', hiragana: 'きっちん', meaning_es: 'Cocina / Espacio culinario', level: 'N5' },
          { kanji: '流し台', hiragana: 'ながしだい', meaning_es: 'Fregadero', level: 'N4' },
          { kanji: 'シンク', hiragana: 'しんく', meaning_es: 'Fregadero / Pila', level: 'N4' },
          { kanji: '蛇口', hiragana: 'じゃぐち', meaning_es: 'Grifo', level: 'N4' },
          { kanji: '調理台', hiragana: 'ちょうりだい', meaning_es: 'Encimera de cocina', level: 'N4' },
          { kanji: '食器棚', hiragana: 'しょっきだな', meaning_es: 'Alacena / Armario de platos', level: 'N4' },
          { kanji: '換気扇', hiragana: 'かんきせん', meaning_es: 'Extractor de humos / Ventilador', level: 'N4' },
          { kanji: '水切りかご', hiragana: 'みずきりかご', meaning_es: 'Escurridor de platos', level: 'N4' },
          { kanji: 'パントリー', hiragana: 'ぱんとりー', meaning_es: 'Despensa', level: 'N4' },
          { kanji: '冷凍庫', hiragana: 'れいとうこ', meaning_es: 'Congelador', level: 'N4' },
          { kanji: '三角コーナー', hiragana: 'さんかくこーなー', meaning_es: 'Recipiente esquinero para restos de comida', level: 'N3' },
          { kanji: '食器かご', hiragana: 'しょっきかご', meaning_es: 'Cesta para cubiertos y loza', level: 'N4' }
        ]
      },
      {
        id: 'u5-l13-electrodomesticos-cocina-detallada',
        title: 'Electrodomésticos de cocina',
        japanese_title: '調理家電・電化製品',
        description: 'Nevera, microondas, arrocera, horno, fogón, batidora y hervidor',
        words: [
          { kanji: '冷蔵庫', hiragana: 'れいぞうこ', meaning_es: 'Frigorífico / Nevera', level: 'N5' },
          { kanji: '電子レンジ', hiragana: 'でんしれんじ', meaning_es: 'Microondas', level: 'N4' },
          { kanji: '炊飯器', hiragana: 'すいはんき', meaning_es: 'Arrocera eléctrica', level: 'N4' },
          { kanji: 'ガスコンロ', hiragana: 'がすこんろ', meaning_es: 'Fogón / Cocina de gas', level: 'N4' },
          { kanji: 'オーブン', hiragana: 'おーぶん', meaning_es: 'Horno', level: 'N4' },
          { kanji: '電気ケトル', hiragana: 'でんきけとる', meaning_es: 'Hervidor de agua eléctrico', level: 'N4' },
          { kanji: 'トースター', hiragana: 'とーすたー', meaning_es: 'Tostadora', level: 'N4' },
          { kanji: 'ミキサー', hiragana: 'みきさー', meaning_es: 'Batidora de vaso / Licuadora', level: 'N4' },
          { kanji: '食器洗い機', hiragana: 'しょっきあらいき', meaning_es: 'Lavavajillas', level: 'N3' },
          { kanji: 'ホットプレート', hiragana: 'ほっとぷれーと', meaning_es: 'Plancha eléctrica de cocina', level: 'N4' },
          { kanji: 'コーヒーメーカー', hiragana: 'こーひーめーかー', meaning_es: 'Cafetera eléctrica', level: 'N4' },
          { kanji: 'フードプロセッサー', hiragana: 'ふーどぷろせっさー', meaning_es: 'Procesador de alimentos', level: 'N4' }
        ]
      },
      {
        id: 'u5-l14-utensilios-cocina',
        title: 'Menaje y utensilios de cocina',
        japanese_title: '調理器具・台所道具',
        description: 'Sartenes, cazuelas, cuchillos, tablas, espátulas y coladores',
        words: [
          { kanji: 'フライパン', hiragana: 'ふらいぱん', meaning_es: 'Sartén', level: 'N4' },
          { kanji: '鍋', hiragana: 'なべ', meaning_es: 'Olla / Cazuela', level: 'N4' },
          { kanji: '包丁', hiragana: 'ほうちょう', meaning_es: 'Cuchillo de cocina', level: 'N4' },
          { kanji: 'まな板', hiragana: 'まないた', meaning_es: 'Tabla de cortar', level: 'N4' },
          { kanji: 'お玉', hiragana: 'おたま', meaning_es: 'Cucharón para servir sopa', level: 'N4' },
          { kanji: 'フライ返し', hiragana: 'ふらいがえし', meaning_es: 'Espátula de cocina', level: 'N4' },
          { kanji: 'ざる', hiragana: 'ざる', meaning_es: 'Colador / Escurridor', level: 'N4' },
          { kanji: 'ピーラー', hiragana: 'ぴーらー', meaning_es: 'Pelador de verduras', level: 'N4' },
          { kanji: '泡立て器', hiragana: 'あわだてき', meaning_es: 'Batidor de varillas', level: 'N4' },
          { kanji: 'ボウル', hiragana: 'ぼうる', meaning_es: 'Bol / Cuenco para mezclar', level: 'N4' },
          { kanji: '缶切り', hiragana: 'かんきり', meaning_es: 'Abrelatas', level: 'N4' },
          { kanji: '栓抜き', hiragana: 'せんぬき', meaning_es: 'Abrebotellas', level: 'N4' },
          { kanji: '計量カップ', hiragana: 'けいりょうかっぷ', meaning_es: 'Vaso medidor', level: 'N4' },
          { kanji: '計量スプーン', hiragana: 'けいりょうすぷーん', meaning_es: 'Cuchara medidora', level: 'N4' },
          { kanji: '菜箸', hiragana: 'さいばし', meaning_es: 'Palillos largos para cocinar', level: 'N4' }
        ]
      },
      {
        id: 'u5-l15-acciones-cocinar',
        title: 'Acciones y verbos de cocina',
        japanese_title: '調理動作・料理の動詞',
        description: 'Cortar, picar, hervir, freír, saltear, mezclar, batir y asar',
        words: [
          { kanji: '切る', hiragana: 'きる', meaning_es: 'Cortar', level: 'N5' },
          { kanji: '刻む', hiragana: 'きざむ', meaning_es: 'Picar fino', level: 'N3' },
          { kanji: '煮る', hiragana: 'にる', meaning_es: 'Cocer a fuego lento', level: 'N4' },
          { kanji: '焼く', hiragana: 'やく', meaning_es: 'Asar / Tostar / Hornear', level: 'N5' },
          { kanji: '揚げる', hiragana: 'あげる', meaning_es: 'Freír en abundante aceite', level: 'N4' },
          { kanji: '炒める', hiragana: 'いためる', meaning_es: 'Saltear en sartén', level: 'N4' },
          { kanji: '茹でる', hiragana: 'ゆでる', meaning_es: 'Hervir en agua caliente', level: 'N4' },
          { kanji: '混ぜる', hiragana: 'まぜる', meaning_es: 'Mezclar / Revolver', level: 'N4' },
          { kanji: '泡立てる', hiragana: 'あわだてる', meaning_es: 'Batir / Montar nata', level: 'N3' },
          { kanji: '蒸す', hiragana: 'むす', meaning_es: 'Cocinar al vapor', level: 'N4' },
          { kanji: '味見する', hiragana: 'あじみする', meaning_es: 'Probar / Degustar', level: 'N4' },
          { kanji: 'ひっくり返す', hiragana: 'ひっくりかえす', meaning_es: 'Dar la vuelta en la sartén', level: 'N3' },
          { kanji: '注ぐ', hiragana: 'そそぐ', meaning_es: 'Verter líquido', level: 'N3' },
          { kanji: '冷ます', hiragana: 'さます', meaning_es: 'Dejar enfriar', level: 'N4' },
          { kanji: '温める', hiragana: 'あたためる', meaning_es: 'Calentar comida', level: 'N4' }
        ]
      },
      {
        id: 'u5-l16-tecnicas-culinarias',
        title: 'Técnicas y métodos culinarios',
        japanese_title: '調理技法・火加減・盛り付け',
        description: 'Intensidad del fuego, sazón, marinado, desespumado y emplatado',
        words: [
          { kanji: '下ごしらえ', hiragana: 'したごしらえ', meaning_es: 'Preparación previa de ingredientes', level: 'N3' },
          { kanji: '漬ける', hiragana: 'つける', meaning_es: 'Marinar / Poner en remojo', level: 'N4' },
          { kanji: '味付け', hiragana: 'あじつけ', meaning_es: 'Condimentación / Sazón', level: 'N4' },
          { kanji: '強火', hiragana: 'つよび', meaning_es: 'Fuego fuerte', level: 'N4' },
          { kanji: '中火', hiragana: 'ちゅうび', meaning_es: 'Fuego medio', level: 'N4' },
          { kanji: '弱火', hiragana: 'よわび', meaning_es: 'Fuego lento / suave', level: 'N4' },
          { kanji: 'とろ火', hiragana: 'とろび', meaning_es: 'Fuego muy bajo', level: 'N3' },
          { kanji: '隠し味', hiragana: 'かくしあじ', meaning_es: 'Toque secreto / Ingrediente oculto', level: 'N3' },
          { kanji: '盛り付け', hiragana: 'もりつけ', meaning_es: 'Emplatado / Presentación del plato', level: 'N3' },
          { kanji: '計量', hiragana: 'けいりょう', meaning_es: 'Medición de ingredientes', level: 'N3' },
          { kanji: '湯切り', hiragana: 'ゆぎり', meaning_es: 'Escurrido de agua caliente', level: 'N4' },
          { kanji: 'あく取り', hiragana: 'あくとり', meaning_es: 'Retirada de espuma e impurezas', level: 'N3' },
          { kanji: '煮詰める', hiragana: 'につめる', meaning_es: 'Reducir la salsa por ebullición', level: 'N3' },
          { kanji: '焦げ目を付ける', hiragana: 'こげめをつける', meaning_es: 'Dorar la superficie', level: 'N3' }
        ]
      },
      {
        id: 'u5-l1-alimentos-esenciales',
        title: 'Alimentos esenciales y cereales',
        japanese_title: '主食・基本食材',
        description: 'Arroz, pan, fideos, huevos y condimentos primordiales',
        words: [
          { kanji: 'ご飯', hiragana: 'ごはん', meaning_es: 'Arroz cocido / Comida', level: 'N5' },
          { kanji: 'パン', hiragana: 'ぱん', meaning_es: 'Pan', level: 'N5' },
          { kanji: '麺', hiragana: 'めん', meaning_es: 'Fideos / Pasta', level: 'N4' },
          { kanji: '卵', hiragana: 'たまご', meaning_es: 'Huevo', level: 'N5' },
          { kanji: '豆腐', hiragana: 'とうふ', meaning_es: 'Tofu / Queso de soja', level: 'N5' },
          { kanji: '味噌', hiragana: 'みそ', meaning_es: 'Pasta fermentada de miso', level: 'N4' },
          { kanji: '醤油', hiragana: 'しょうゆ', meaning_es: 'Salsa de soja', level: 'N5' },
          { kanji: '塩', hiragana: 'しお', meaning_es: 'Sal', level: 'N5' },
          { kanji: '砂糖', hiragana: 'さとう', meaning_es: 'Azúcar', level: 'N5' },
          { kanji: '油', hiragana: 'あぶら', meaning_es: 'Aceite vegetal / Grasa comestible', level: 'N4' }
        ]
      },
      {
        id: 'u5-l2-carnes-aves',
        title: 'Carnes, aves y preparados',
        japanese_title: '肉類・食肉加工品',
        description: 'Carne de vacuno, cerdo, pollo, picada y embutidos',
        words: [
          { kanji: '肉', hiragana: 'にく', meaning_es: 'Carne', level: 'N5' },
          { kanji: '牛肉', hiragana: 'ぎゅうにく', meaning_es: 'Carne de vaca / ternera', level: 'N5' },
          { kanji: '豚肉', hiragana: 'ぶたにく', meaning_es: 'Carne de cerdo', level: 'N5' },
          { kanji: '鶏肉', hiragana: 'とりにく', meaning_es: 'Carne de pollo', level: 'N5' },
          { kanji: '挽肉', hiragana: 'ひきにく', meaning_es: 'Carne picada', level: 'N4' },
          { kanji: 'ハム', hiragana: 'はむ', meaning_es: 'Jamón cocido', level: 'N5' },
          { kanji: 'ソーセージ', hiragana: 'そーせーじ', meaning_es: 'Salchicha', level: 'N5' },
          { kanji: 'ステーキ', hiragana: 'すてーき', meaning_es: 'Bistec / Filete de ternera', level: 'N4' },
          { kanji: '唐揚げ', hiragana: 'からあげ', meaning_es: 'Pollo frito estilo japonés', level: 'N4' },
          { kanji: '焼き鳥', hiragana: 'やきとり', meaning_es: 'Brochetas de pollo asado', level: 'N4' }
        ]
      },
      {
        id: 'u5-l3-pescados-mariscos',
        title: 'Pescados y mariscos tradicionales',
        japanese_title: '魚介類・海の幸料理',
        description: 'Sashimi, sushi, pescados asados, mariscos y algas',
        words: [
          { kanji: '魚', hiragana: 'さかな', meaning_es: 'Pescado (alimento)', level: 'N5' },
          { kanji: '刺身', hiragana: 'さしみ', meaning_es: 'Sashimi (pescado crudo fileteado)', level: 'N4' },
          { kanji: '寿司', hiragana: 'すし', meaning_es: 'Sushi japonés', level: 'N5' },
          { kanji: '焼き魚', hiragana: 'やきざかな', meaning_es: 'Pescado asado a la parrilla', level: 'N4' },
          { kanji: '煮魚', hiragana: 'にざかな', meaning_es: 'Pescado estofado en salsa', level: 'N4' },
          { kanji: '鰻', hiragana: 'うなぎ', meaning_es: 'Anguila de agua dulce', level: 'N4' },
          { kanji: '鯛', hiragana: 'たい', meaning_es: 'Besugo / Pargo', level: 'N4' },
          { kanji: '秋刀魚', hiragana: 'さんま', meaning_es: 'Paparda del Pacífico', level: 'N4' },
          { kanji: '鯖', hiragana: 'さば', meaning_es: 'Caballa', level: 'N4' },
          { kanji: '鮭', hiragana: 'さけ', meaning_es: 'Salmón comestible', level: 'N4' },
          { kanji: '鮪', hiragana: 'まぐろ', meaning_es: 'Atún fresco', level: 'N4' },
          { kanji: '海苔', hiragana: 'のり', meaning_es: 'Alga nori seca', level: 'N4' }
        ]
      },
      {
        id: 'u5-l4-verduras-hortalizas',
        title: 'Verduras y hortalizas',
        japanese_title: '野菜・根菜・葉物',
        description: 'Col, tomates, cebollas, zanahorias, daikon y espinacas',
        words: [
          { kanji: '野菜', hiragana: 'やさい', meaning_es: 'Verdura / Hortaliza', level: 'N5' },
          { kanji: 'キャベツ', hiragana: 'きゃべつ', meaning_es: 'Col / Repollo', level: 'N5' },
          { kanji: 'トマト', hiragana: 'とまと', meaning_es: 'Tomate', level: 'N5' },
          { kanji: '玉ねぎ', hiragana: 'たまねぎ', meaning_es: 'Cebolla', level: 'N4' },
          { kanji: '人参', hiragana: 'にんじん', meaning_es: 'Zanahoria', level: 'N4' },
          { kanji: '大根', hiragana: 'だいこん', meaning_es: 'Rábano blanco japonés (Daikon)', level: 'N4' },
          { kanji: 'きゅうり', hiragana: 'きゅうり', meaning_es: 'Pepino', level: 'N4' },
          { kanji: 'じゃがいも', hiragana: 'じゃがいも', meaning_es: 'Patata / Papa', level: 'N4' },
          { kanji: 'ほうれん草', hiragana: 'ほうれんそう', meaning_es: 'Espinaca', level: 'N4' },
          { kanji: 'レタス', hiragana: 'れたす', meaning_es: 'Lechuga', level: 'N5' }
        ]
      },
      {
        id: 'u5-l5-frutas-frescas',
        title: 'Frutas frescas',
        japanese_title: '果物・フルーツ',
        description: 'Manzanas, mandarinas, plátanos, uvas, fresas y sandía',
        words: [
          { kanji: '果物', hiragana: 'くだもの', meaning_es: 'Fruta', level: 'N5' },
          { kanji: 'りんご', hiragana: 'りんご', meaning_es: 'Manzana', level: 'N5' },
          { kanji: 'みかん', hiragana: 'みかん', meaning_es: 'Mandarina japonesa', level: 'N5' },
          { kanji: 'バナナ', hiragana: 'ばなな', meaning_es: 'Plátano / Banana', level: 'N5' },
          { kanji: '葡萄', hiragana: 'ぶどう', meaning_es: 'Uva', level: 'N4' },
          { kanji: '苺', hiragana: 'いちご', meaning_es: 'Fresa', level: 'N4' },
          { kanji: '桃', hiragana: 'もも', meaning_es: 'Melocotón / Durazno', level: 'N4' },
          { kanji: '西瓜', hiragana: 'すいか', meaning_es: 'Sandía', level: 'N4' },
          { kanji: '梨', hiragana: 'なし', meaning_es: 'Pera japonesa', level: 'N4' },
          { kanji: '檸檬', hiragana: 'れもん', meaning_es: 'Limón', level: 'N4' }
        ]
      },
      {
        id: 'u5-l6-bebidas-frias-calientes',
        title: 'Bebidas frías y calientes',
        japanese_title: '飲み物・茶・清涼飲料',
        description: 'Agua, té verde, té negro, café, cerveza y licores',
        words: [
          { kanji: '水', hiragana: 'みず', meaning_es: 'Agua potable fría', level: 'N5' },
          { kanji: 'お茶', hiragana: 'おちゃ', meaning_es: 'Té verde / Infusión de cortesía', level: 'N5' },
          { kanji: '緑茶', hiragana: 'りょくちゃ', meaning_es: 'Té verde japonés', level: 'N4' },
          { kanji: '紅茶', hiragana: 'こうちゃ', meaning_es: 'Té negro / Té occidental', level: 'N5' },
          { kanji: '珈琲', hiragana: 'こーひー', meaning_es: 'Café', level: 'N5' },
          { kanji: '牛乳', hiragana: 'ぎゅうにゅう', meaning_es: 'Leche de vaca', level: 'N5' },
          { kanji: '果汁', hiragana: 'かじゅう', meaning_es: 'Zumo de fruta / Jugo natural', level: 'N3' },
          { kanji: 'ビール', hiragana: 'びーる', meaning_es: 'Cerveza', level: 'N5' },
          { kanji: '日本酒', hiragana: 'にほんしゅ', meaning_es: 'Sake tradicional japonés', level: 'N4' },
          { kanji: '氷', hiragana: 'こおり', meaning_es: 'Hielo para bebidas', level: 'N4' }
        ]
      },
      {
        id: 'u5-l7-platos-populares',
        title: 'Platos populares y especialidades',
        japanese_title: '定番料理・ご当地グルメ',
        description: 'Curry japonés, ramen, tempura, soba y bento tradicional',
        words: [
          { kanji: 'カレー', hiragana: 'かれー', meaning_es: 'Curry japonés con arroz', level: 'N5' },
          { kanji: 'ラーメン', hiragana: 'らーめん', meaning_es: 'Sopa de fideos ramen', level: 'N5' },
          { kanji: 'うどん', hiragana: 'うどん', meaning_es: 'Fideos gruesos udon', level: 'N4' },
          { kanji: '蕎麦', hiragana: 'そば', meaning_es: 'Fideos de trigo sarraceno soba', level: 'N4' },
          { kanji: '天ぷら', hiragana: 'てんぷら', meaning_es: 'Fritura tempura de verdura o marisco', level: 'N5' },
          { kanji: 'お好み焼き', hiragana: 'おこのみやき', meaning_es: 'Tortilla salada okonomiyaki', level: 'N4' },
          { kanji: '牛丼', hiragana: 'ぎゅうどん', meaning_es: 'Cuenco de arroz con carne de vacuno gyudon', level: 'N4' },
          { kanji: '餃子', hiragana: 'ぎょうざ', meaning_es: 'Empanadillas gyoza al vapor o a la plancha', level: 'N4' },
          { kanji: '弁当', hiragana: 'べんとう', meaning_es: 'Caja de comida preparada bento', level: 'N5' },
          { kanji: '定食', hiragana: 'ていしょく', meaning_es: 'Menú combinado / Comida completa', level: 'N4' }
        ]
      },
      {
        id: 'u5-l8-sabores-adjetivos',
        title: 'Sabores y adjetivos culinarios',
        japanese_title: '味覚表現・料理の感想',
        description: 'Delicioso, dulce, picante, salado, amargo y ácido',
        words: [
          { kanji: '美味しい', hiragana: 'おいしい', meaning_es: 'Delicioso / Rico', level: 'N5' },
          { kanji: 'まずい', hiragana: 'まずい', meaning_es: 'De mal sabor / Desagradable', level: 'N5' },
          { kanji: '甘い', hiragana: 'あまい', meaning_es: 'Dulce', level: 'N5' },
          { kanji: '辛い', hiragana: 'からい', meaning_es: 'Picante', level: 'N5' },
          { kanji: '塩辛い', hiragana: 'しおからい', meaning_es: 'Salado', level: 'N4' },
          { kanji: '酸っぱい', hiragana: 'すっぱい', meaning_es: 'Ácido / Agrio', level: 'N4' },
          { kanji: '苦い', hiragana: 'にがい', meaning_es: 'Amargo', level: 'N4' },
          { kanji: '濃い', hiragana: 'こい', meaning_es: 'Sabor intenso / Concentrado / Espeso', level: 'N4' },
          { kanji: '薄い', hiragana: 'うすい', meaning_es: 'Sabor suave / Aguado / Ligero', level: 'N4' },
          { kanji: '熱い', hiragana: 'あつい', meaning_es: 'Caliente (temperatura de alimentos)', level: 'N5' }
        ]
      },
      {
        id: 'u5-l9-restaurante-pedidos',
        title: 'En el restaurante: pedidos y modales',
        japanese_title: '外食・注文・会計',
        description: 'Carta, pedidos, cuentas, modales en mesa y áreas de no fumadores',
        words: [
          { kanji: 'レストラン', hiragana: 'れすとらん', meaning_es: 'Restaurante', level: 'N5' },
          { kanji: '居酒屋', hiragana: 'いざかや', meaning_es: 'Taberna japonesa izakaya', level: 'N4' },
          { kanji: 'メニュー', hiragana: 'めにゅー', meaning_es: 'Carta de platos / Menú', level: 'N5' },
          { kanji: '注文', hiragana: 'ちゅうもん', meaning_es: 'Pedido / Encargo de comida', level: 'N4' },
          { kanji: '会計', hiragana: 'かいけい', meaning_es: 'Cuenta / Pago en caja', level: 'N4' },
          { kanji: 'お勘定', hiragana: 'おかんじょう', meaning_es: 'La cuenta por favor', level: 'N4' },
          { kanji: 'ごちそう', hiragana: 'ごちそう', meaning_es: 'Banquete / Agradecimiento tras comer', level: 'N5' },
          { kanji: '乾杯', hiragana: 'かんぱい', meaning_es: '¡Salud! / Brindis', level: 'N4' },
          { kanji: 'おすすめ', hiragana: 'おすすめ', meaning_es: 'Recomendación del chef', level: 'N4' },
          { kanji: '禁煙', hiragana: 'きんえん', meaning_es: 'Prohibido fumar / Zona de no fumadores', level: 'N4' }
        ]
      }
    ]
  },

  // -----------------------------------------------------------------------
  // UNIDAD 7: La Ciudad, el Transporte, la Orientación y las Compras
  // -----------------------------------------------------------------------
  {
    id: 'unit-7-ciudad-transporte',
    title: 'Unidad 7: La Ciudad, el Transporte, la Orientación y las Compras',
    japanese_title: '都市・交通・移動・買い物',
    subtitle: 'Transportes públicos, estaciones, edificios de la ciudad, tiendas y orientación espacial',
    kanji_icon: '街',
    color: '#6366f1',
    bg_gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u6-l1-medios-transporte',
        title: 'Medios de transporte',
        japanese_title: '交通機関・乗り物',
        description: 'Tren, metro, tren bala, autobús, taxi, barco y bicicleta',
        words: [
          { kanji: '電車', hiragana: 'でんしゃ', meaning_es: 'Tren eléctrico', level: 'N5' },
          { kanji: '地下鉄', hiragana: 'ちかてつ', meaning_es: 'Metro subterráneo', level: 'N5' },
          { kanji: '新幹線', hiragana: 'しんかんせん', meaning_es: 'Tren bala Shinkansen', level: 'N5' },
          { kanji: 'バス', hiragana: 'ばす', meaning_es: 'Autobús', level: 'N5' },
          { kanji: 'タクシー', hiragana: 'たくしー', meaning_es: 'Taxi', level: 'N5' },
          { kanji: '飛行機', hiragana: 'ひこうき', meaning_es: 'Avión', level: 'N5' },
          { kanji: '船', hiragana: 'ふね', meaning_es: 'Barco / Embarcación', level: 'N5' },
          { kanji: '自転車', hiragana: 'じてんしゃ', meaning_es: 'Bicicleta', level: 'N5' },
          { kanji: '自動車', hiragana: 'じどうしゃ', meaning_es: 'Automóvil / Coche', level: 'N5' },
          { kanji: 'バイク', hiragana: 'ばいく', meaning_es: 'Motocicleta', level: 'N4' }
        ]
      },
      {
        id: 'u6-l2-estacion-viajes',
        title: 'La estación de tren y el aeropuerto',
        japanese_title: '駅・空港・切符と乗り場',
        description: 'Tornos de acceso, andenes, transbordos y billetes',
        words: [
          { kanji: '駅', hiragana: 'えき', meaning_es: 'Estación de tren', level: 'N5' },
          { kanji: '改札口', hiragana: 'かいさつぐち', meaning_es: 'Torno de control / Puerta de acceso a andenes', level: 'N4' },
          { kanji: '切符', hiragana: 'きっぷ', meaning_es: 'Billete / Pasaje de viaje', level: 'N5' },
          { kanji: 'ホーム', hiragana: 'ほーむ', meaning_es: 'Andén de estación', level: 'N5' },
          { kanji: '乗り場', hiragana: 'のりば', meaning_es: 'Parada / Punto de embarque', level: 'N4' },
          { kanji: '空港', hiragana: 'くうこう', meaning_es: 'Aeropuerto', level: 'N5' },
          { kanji: '便', hiragana: 'びん', meaning_es: 'Vuelo / Línea de transporte regular', level: 'N4' },
          { kanji: '案内所', hiragana: 'あんないじょ', meaning_es: 'Oficina de información', level: 'N4' },
          { kanji: '乗り換え', hiragana: 'のりかえ', meaning_es: 'Transbordo / Cambio de línea', level: 'N4' },
          { kanji: '定期券', hiragana: 'ていきけん', meaning_es: 'Abono de transporte mensual', level: 'N4' }
        ]
      },
      {
        id: 'u6-l3-edificios-publicos',
        title: 'Edificios y lugares públicos',
        japanese_title: '公共施設・街の建物',
        description: 'Bancos, ayuntamiento, correos, bibliotecas y comisarías',
        words: [
          { kanji: '郵便局', hiragana: 'ゆうびんきょく', meaning_es: 'Oficina de correos', level: 'N5' },
          { kanji: '銀行', hiragana: 'ぎんこう', meaning_es: 'Banco (entidad financiera)', level: 'N5' },
          { kanji: '市役所', hiragana: 'しやくしょ', meaning_es: 'Ayuntamiento / Alcaldía', level: 'N4' },
          { kanji: '図書館', hiragana: 'としょかん', meaning_es: 'Biblioteca pública', level: 'N5' },
          { kanji: '警察署', hiragana: 'けいさつしょ', meaning_es: 'Comisaría de policía central', level: 'N4' },
          { kanji: '交番', hiragana: 'こうばん', meaning_es: 'Puesto de policía de barrio (Koban)', level: 'N5' },
          { kanji: '美術館', hiragana: 'びじゅつかん', meaning_es: 'Museo de arte', level: 'N4' },
          { kanji: '公園', hiragana: 'こうえん', meaning_es: 'Parque público', level: 'N5' },
          { kanji: '大学', hiragana: 'だいがく', meaning_es: 'Universidad / Centro de estudios superiores', level: 'N5' },
          { kanji: '神社', hiragana: 'じんじゃ', meaning_es: 'Santuario sintoísta', level: 'N4' }
        ]
      },
      {
        id: 'u6-l4-tiendas-comercio',
        title: 'Establecimientos y tiendas comerciales',
        japanese_title: '店舗・商業施設・レジ',
        description: 'Supermercados, combini, grandes almacenes y librerías',
        words: [
          { kanji: '店', hiragana: 'みせ', meaning_es: 'Tienda / Comercio', level: 'N5' },
          { kanji: 'コンビニ', hiragana: 'こんびに', meaning_es: 'Tienda de conveniencia abierta 24h', level: 'N5' },
          { kanji: 'スーパー', hiragana: 'すーぱー', meaning_es: 'Supermercado', level: 'N5' },
          { kanji: 'デパート', hiragana: 'でぱーと', meaning_es: 'Grandes almacenes', level: 'N5' },
          { kanji: '本屋', hiragana: 'ほんや', meaning_es: 'Librería', level: 'N5' },
          { kanji: '薬局', hiragana: 'やっきょく', meaning_es: 'Farmacia / Botica', level: 'N4' },
          { kanji: '花屋', hiragana: 'はなや', meaning_es: 'Floristería', level: 'N5' },
          { kanji: 'パン屋', hiragana: 'ぱんや', meaning_es: 'Panadería', level: 'N5' },
          { kanji: '売り場', hiragana: 'うりば', meaning_es: 'Sección / Mostrador de venta', level: 'N4' },
          { kanji: 'レジ', hiragana: 'れじ', meaning_es: 'Caja registradora', level: 'N4' }
        ]
      },
      {
        id: 'u6-l5-posicion-espacial',
        title: 'Posición espacial y referencias',
        japanese_title: '位置・方向・空間関係',
        description: 'Arriba, abajo, delante, detrás, dentro, fuera y al lado',
        words: [
          { kanji: '上', hiragana: 'うえ', meaning_es: 'Arriba / Encima', level: 'N5' },
          { kanji: '下', hiragana: 'した', meaning_es: 'Abajo / Debajo', level: 'N5' },
          { kanji: '前', hiragana: 'まえ', meaning_es: 'Delante / En frente', level: 'N5' },
          { kanji: '後ろ', hiragana: 'うしろ', meaning_es: 'Detrás', level: 'N5' },
          { kanji: '中', hiragana: 'なか', meaning_es: 'Dentro / Interior', level: 'N5' },
          { kanji: '外', hiragana: 'そと', meaning_es: 'Fuera / Exterior', level: 'N5' },
          { kanji: '隣', hiragana: 'となり', meaning_es: 'Al lado / Vecino contiguo', level: 'N5' },
          { kanji: '近く', hiragana: 'ちかく', meaning_es: 'Cerca / En las proximidades', level: 'N5' },
          { kanji: '間', hiragana: 'あいだ', meaning_es: 'Entre / En medio', level: 'N5' },
          { kanji: 'そば', hiragana: 'そば', meaning_es: 'Al lado / Junto a', level: 'N5' }
        ]
      },
      {
        id: 'u6-l6-orientacion-direcciones',
        title: 'Orientación urbana y puntos cardinales',
        japanese_title: '方角・道順・案内',
        description: 'Norte, sur, este, oeste, giros y rectas en la calle',
        words: [
          { kanji: '東', hiragana: 'ひがし', meaning_es: 'Este (punto cardinal)', level: 'N5' },
          { kanji: '西', hiragana: 'にし', meaning_es: 'Oeste (punto cardinal)', level: 'N5' },
          { kanji: '南', hiragana: 'みなみ', meaning_es: 'Sur (punto cardinal)', level: 'N5' },
          { kanji: '北', hiragana: 'きた', meaning_es: 'Norte (punto cardinal)', level: 'N5' },
          { kanji: '右', hiragana: 'みぎ', meaning_es: 'Derecha', level: 'N5' },
          { kanji: '左', hiragana: 'ひだり', meaning_es: 'Izquierda', level: 'N5' },
          { kanji: 'まっすぐ', hiragana: 'まっすぐ', meaning_es: 'Todo recto / En línea recta', level: 'N5' },
          { kanji: '曲がる', hiragana: 'まがる', meaning_es: 'Girar / Doblar una esquina', level: 'N5' },
          { kanji: '渡る', hiragana: 'わたる', meaning_es: 'Cruzar una calle o puente', level: 'N5' },
          { kanji: '通り', hiragana: 'とおり', meaning_es: 'Avenida / Calle transitada', level: 'N4' }
        ]
      },
      {
        id: 'u6-l7-verbos-movimiento',
        title: 'Verbos de movimiento y desplazamiento',
        japanese_title: '移動動詞・歩行・乗車',
        description: 'Ir, venir, volver, subir, bajar, caminar y correr',
        words: [
          { kanji: '行く', hiragana: 'いく', meaning_es: 'Ir a un lugar', level: 'N5' },
          { kanji: '来る', hiragana: 'くる', meaning_es: 'Venir hacia aquí', level: 'N5' },
          { kanji: '帰る', hiragana: 'かえる', meaning_es: 'Volver a casa / Regresar', level: 'N5' },
          { kanji: '歩く', hiragana: 'あるく', meaning_es: 'Caminar / Ir a pie', level: 'N5' },
          { kanji: '走る', hiragana: 'はしる', meaning_es: 'Correr', level: 'N5' },
          { kanji: '乗る', hiragana: 'のる', meaning_es: 'Subir a un transporte / Montar', level: 'N5' },
          { kanji: '降りる', hiragana: 'おりる', meaning_es: 'Bajar de un vehículo', level: 'N5' },
          { kanji: '止まる', hiragana: 'とまる', meaning_es: 'Detenerse / Parar', level: 'N5' },
          { kanji: '渡す', hiragana: 'わたす', meaning_es: 'Entregar / Hacer pasar al otro lado', level: 'N5' },
          { kanji: '通る', hiragana: 'とおる', meaning_es: 'Pasar por / Atravesar una vía', level: 'N4' }
        ]
      },
      {
        id: 'u6-l8-dinero-compras',
        title: 'Dinero, precios y transacciones',
        japanese_title: '金銭・価格・支払い',
        description: 'Monedas, billetes, descuentos, recibos y pagar en caja',
        words: [
          { kanji: 'お金', hiragana: 'おかね', meaning_es: 'Dinero', level: 'N5' },
          { kanji: '硬貨', hiragana: 'こうか', meaning_es: 'Moneda metálica', level: 'N4' },
          { kanji: 'お札', hiragana: 'おさつ', meaning_es: 'Billete de dinero', level: 'N4' },
          { kanji: '値段', hiragana: 'ねだん', meaning_es: 'Precio / Coste', level: 'N5' },
          { kanji: '割引', hiragana: 'わりびき', meaning_es: 'Descuento / Rebaja porcentual', level: 'N4' },
          { kanji: 'レシート', hiragana: 'れしーと', meaning_es: 'Ticket de compra / Recibo de caja', level: 'N4' },
          { kanji: 'クレジットカード', hiragana: 'くれじっとかーど', meaning_es: 'Tarjeta de crédito bancaria', level: 'N4' },
          { kanji: '支払う', hiragana: 'しはらう', meaning_es: 'Pagar un importe', level: 'N4' },
          { kanji: '買う', hiragana: 'かう', meaning_es: 'Comprar', level: 'N5' },
          { kanji: '売る', hiragana: 'うる', meaning_es: 'Vender', level: 'N5' }
        ]
      }
    ]
  },

  // -----------------------------------------------------------------------
  // UNIDAD 8: Trabajo, Profesiones, Escuela y Sociedad
  // -----------------------------------------------------------------------
  {
    id: 'unit-8-trabajo-educacion',
    title: 'Unidad 8: Trabajo, Profesiones, Escuela y Sociedad',
    japanese_title: '仕事・職業・教育・社会生活',
    subtitle: 'Oficios, ambiente laboral, aula escolar, material de estudio y civismo',
    kanji_icon: '学',
    color: '#14b8a6',
    bg_gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u7-l1-profesiones-oficios',
        title: 'Profesiones y oficios comunes',
        japanese_title: '職業・専門職・働き手',
        description: 'Médicos, profesores, policías, abogados y empleados',
        words: [
          { kanji: '先生', hiragana: 'せんせい', meaning_es: 'Profesor / Maestro / Doctor', level: 'N5' },
          { kanji: '学生', hiragana: 'がくせい', meaning_es: 'Estudiante', level: 'N5' },
          { kanji: '会社員', hiragana: 'かいしゃいん', meaning_es: 'Empleado de empresa privada', level: 'N5' },
          { kanji: '銀行員', hiragana: 'ぎんこういん', meaning_es: 'Empleado de banca', level: 'N5' },
          { kanji: '店員', hiragana: 'てんいん', meaning_es: 'Dependiente / Empleado de tienda', level: 'N5' },
          { kanji: '警察官', hiragana: 'けいさつかん', meaning_es: 'Agente de policía', level: 'N4' },
          { kanji: '弁護士', hiragana: 'べんごし', meaning_es: 'Abogado / Letrado', level: 'N3' },
          { kanji: '運転手', hiragana: 'うんてんしゅ', meaning_es: 'Conductor profesional / Chófer', level: 'N4' },
          { kanji: '料理人', hiragana: 'りょうりにん', meaning_es: 'Cocinero / Chef profesional', level: 'N4' },
          { kanji: '職人', hiragana: 'しょくにん', meaning_es: 'Artesano / Maestro de oficio tradicional', level: 'N3' }
        ]
      },
      {
        id: 'u7-l2-escuela-aula',
        title: 'En la escuela y el aula',
        japanese_title: '学校生活・授業・試験',
        description: 'Clases, deberes, exámenes, preguntas y pizarras',
        words: [
          { kanji: '学校', hiragana: 'がっこう', meaning_es: 'Escuela / Colegio', level: 'N5' },
          { kanji: '教室', hiragana: 'きょうしつ', meaning_es: 'Aula de clase', level: 'N5' },
          { kanji: '授業', hiragana: 'じゅぎょう', meaning_es: 'Lección escolar / Clase', level: 'N5' },
          { kanji: '宿題', hiragana: 'しゅくだい', meaning_es: 'Deberes escolares / Tareas para casa', level: 'N5' },
          { kanji: '試験', hiragana: 'しけん', meaning_es: 'Examen / Prueba de evaluación', level: 'N5' },
          { kanji: '質問', hiragana: 'しつもん', meaning_es: 'Pregunta / Duda', level: 'N5' },
          { kanji: '答え', hiragana: 'こたえ', meaning_es: 'Respuesta / Solución', level: 'N5' },
          { kanji: '黒板', hiragana: 'こくばん', meaning_es: 'Pizarra de tiza', level: 'N4' },
          { kanji: '座席', hiragana: 'ざせき', meaning_es: 'Asiento escolar asignado', level: 'N4' },
          { kanji: '休み時間', hiragana: 'やすみじかん', meaning_es: 'Tiempo de recreo / Descanso entre clases', level: 'N5' }
        ]
      },
      {
        id: 'u7-l3-material-escolar',
        title: 'Material escolar y de estudio',
        japanese_title: '文房具・筆記用具・教材',
        description: 'Libros de texto, cuadernos, lápices, reglas y estuches',
        words: [
          { kanji: '教科書', hiragana: 'きょうかしょ', meaning_es: 'Libro de texto escolar', level: 'N4' },
          { kanji: 'ノート', hiragana: 'のーと', meaning_es: 'Cuaderno de notas / Libreta', level: 'N5' },
          { kanji: '鉛筆', hiragana: 'えんぴつ', meaning_es: 'Lápiz de grafito', level: 'N5' },
          { kanji: '消しゴム', hiragana: 'けしごむ', meaning_es: 'Goma de borrar', level: 'N5' },
          { kanji: '定規', hiragana: 'じょうぎ', meaning_es: 'Regla graduada', level: 'N4' },
          { kanji: 'ペン', hiragana: 'ぺん', meaning_es: 'Bolígrafo / Pluma estilográﬁca', level: 'N5' },
          { kanji: '鋏', hiragana: 'はさみ', meaning_es: 'Tijeras de cortar papel', level: 'N4' },
          { kanji: '筆箱', hiragana: 'ふでばこ', meaning_es: 'Estuche escolar para lápices', level: 'N4' },
          { kanji: '辞書', hiragana: 'じしょ', meaning_es: 'Diccionario lingüístico', level: 'N5' },
          { kanji: '用紙', hiragana: 'ようし', meaning_es: 'Hoja de papel en blanco / Formulario', level: 'N4' }
        ]
      },
      {
        id: 'u7-l4-oficina-corporativo',
        title: 'La oficina y el ambiente laboral',
        japanese_title: '職場・ビジネス環境・残業',
        description: 'Despachos, reuniones, documentos, horas extras y jerarquía',
        words: [
          { kanji: '会社', hiragana: 'かいしゃ', meaning_es: 'Empresa / Compañía', level: 'N5' },
          { kanji: '事務所', hiragana: 'じむしょ', meaning_es: 'Oficina / Despacho administrativo', level: 'N5' },
          { kanji: '会議', hiragana: 'かいぎ', meaning_es: 'Reunión de trabajo', level: 'N4' },
          { kanji: '部長', hiragana: 'ぶちょう', meaning_es: 'Director de departamento / Jefe de división', level: 'N4' },
          { kanji: '同僚', hiragana: 'どうりょう', meaning_es: 'Compañero de trabajo / Colega', level: 'N4' },
          { kanji: '書類', hiragana: 'しょるい', meaning_es: 'Documentos / Informes de trabajo', level: 'N4' },
          { kanji: 'パソコン', hiragana: 'ぱそこん', meaning_es: 'Ordenador personal / PC', level: 'N5' },
          { kanji: 'コピー', hiragana: 'こぴー', meaning_es: 'Fotocopia', level: 'N5' },
          { kanji: '仕事', hiragana: 'しごと', meaning_es: 'Trabajo / Empleo', level: 'N5' },
          { kanji: '残業', hiragana: 'ざんぎょう', meaning_es: 'Horas extraordinarias de trabajo', level: 'N4' }
        ]
      },
      {
        id: 'u7-l5-comunicacion-tramites',
        title: 'Comunicación y citas profesionales',
        japanese_title: '業務連絡・アポイント・面談',
        description: 'Llamadas, correos, citas de negocios y consultas formales',
        words: [
          { kanji: '電話', hiragana: 'でんわ', meaning_es: 'Teléfono / Llamada telefónica', level: 'N5' },
          { kanji: 'メール', hiragana: 'めーる', meaning_es: 'Correo electrónico / E-mail', level: 'N5' },
          { kanji: '連絡', hiragana: 'れんらく', meaning_es: 'Ponerse en contacto / Notificación', level: 'N4' },
          { kanji: '相談', hiragana: 'そうだん', meaning_es: 'Consulta / Pedir consejo profesional', level: 'N4' },
          { kanji: '報告', hiragana: 'ほうこく', meaning_es: 'Informe de gestión / Dar novedades', level: 'N4' },
          { kanji: '約束', hiragana: 'やくそく', meaning_es: 'Compromiso / Cita previa', level: 'N5' },
          { kanji: '予約', hiragana: 'よやく', meaning_es: 'Reserva previa formal', level: 'N4' },
          { kanji: '面談', hiragana: 'めんだん', meaning_es: 'Entrevista / Reunión presencial formal', level: 'N3' },
          { kanji: '尋ねる', hiragana: 'たずねる', meaning_es: 'Preguntar / Inquirir educadamente', level: 'N4' },
          { kanji: '伝える', hiragana: 'つたえる', meaning_es: 'Transmitir un mensaje', level: 'N4' }
        ]
      },
      {
        id: 'u7-l6-sociedad-instituciones',
        title: 'Sociedad, instituciones y civismo',
        japanese_title: '社会制度・法律・文化環境',
        description: 'Leyes, elecciones, impuestos, normas ciudadanas y cultura cívica',
        words: [
          { kanji: '社会', hiragana: 'しゃかい', meaning_es: 'Sociedad', level: 'N5' },
          { kanji: '国', hiragana: 'くに', meaning_es: 'País / Nación / Estado', level: 'N5' },
          { kanji: '法律', hiragana: 'ほうりつ', meaning_es: 'Ley / Normativa jurídica', level: 'N4' },
          { kanji: '政治', hiragana: 'せいじ', meaning_es: 'Política institucional', level: 'N4' },
          { kanji: '選挙', hiragana: 'せんきょ', meaning_es: 'Elecciones públicas / Votación', level: 'N4' },
          { kanji: '経済', hiragana: 'けいざい', meaning_es: 'Economía nacional', level: 'N4' },
          { kanji: '文化', hiragana: 'ぶんか', meaning_es: 'Cultura y civilización', level: 'N5' },
          { kanji: '税金', hiragana: 'ぜいきん', meaning_es: 'Impuestos tributarios', level: 'N4' },
          { kanji: '規則', hiragana: 'きそく', meaning_es: 'Regla / Reglamento de convivencia', level: 'N4' },
          { kanji: '平和', hiragana: 'へいわ', meaning_es: 'Paz comunitaria', level: 'N4' }
        ]
      }
    ]
  },

  // -----------------------------------------------------------------------
  // UNIDAD 9: Emociones, Personalidad, Ocio y Cultura
  // -----------------------------------------------------------------------
  {
    id: 'unit-9-emociones-cultura',
    title: 'Unidad 9: Emociones, Personalidad, Ocio y Cultura',
    japanese_title: '心情・性格・芸術・伝統文化',
    subtitle: 'Sentimientos humanos, carácter, memoria, música, deportes y patrimonio de Japón',
    kanji_icon: '心',
    color: '#8b5cf6',
    bg_gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u8-l1-emociones-positivas',
        title: 'Sentimientos y emociones positivas',
        japanese_title: '喜び・幸福・安心感',
        description: 'Alegría, gratitud, afecto, tranquilidad y entusiasmo',
        words: [
          { kanji: '嬉しい', hiragana: 'うれしい', meaning_es: 'Feliz / Contento (por un suceso)', level: 'N5' },
          { kanji: '楽しい', hiragana: 'たのしい', meaning_es: 'Divertido / Entretenido', level: 'N5' },
          { kanji: '幸せ', hiragana: 'しあわせ', meaning_es: 'Felicidad plena', level: 'N4' },
          { kanji: '好き', hiragana: 'すき', meaning_es: 'Gustar / Agradar', level: 'N5' },
          { kanji: '愛情', hiragana: 'あいじょう', meaning_es: 'Cariño sincero / Afecto', level: 'N3' },
          { kanji: '笑顔', hiragana: 'えがお', meaning_es: 'Cara sonriente / Sonrisa', level: 'N4' },
          { kanji: '感謝', hiragana: 'かんしゃ', meaning_es: 'Agradecimiento / Gratitud profunda', level: 'N4' },
          { kanji: '安心', hiragana: 'あんしん', meaning_es: 'Tranquilidad / Alivio interior', level: 'N5' },
          { kanji: '感動', hiragana: 'かんどう', meaning_es: 'Emoción honda / Quedar conmovido', level: 'N4' },
          { kanji: '喜び', hiragana: 'よろこび', meaning_es: 'Júbilo / Alegría compartida', level: 'N4' }
        ]
      },
      {
        id: 'u8-l2-emociones-dificiles',
        title: 'Emociones difíciles y preocupación',
        japanese_title: '悲しみ・怒り・不安・緊張',
        description: 'Tristeza, soledad, enfado, vergüenza e incertidumbre',
        words: [
          { kanji: '悲しい', hiragana: 'かなしい', meaning_es: 'Triste', level: 'N5' },
          { kanji: '寂しい', hiragana: 'さびしい', meaning_es: 'Solitario / Nostálgico', level: 'N5' },
          { kanji: '怒る', hiragana: 'おこる', meaning_es: 'Enfadarse / Encolerizarse', level: 'N5' },
          { kanji: '嫌い', hiragana: 'きらい', meaning_es: 'Desagradar / No gustar', level: 'N5' },
          { kanji: '不安', hiragana: 'ふあん', meaning_es: 'Ansiedad / Inquietud', level: 'N4' },
          { kanji: '心配', hiragana: 'しんぱい', meaning_es: 'Preocupación', level: 'N5' },
          { kanji: '恥ずかしい', hiragana: 'はずかしい', meaning_es: 'Avergonzado / Tímido', level: 'N4' },
          { kanji: '悔しい', hiragana: 'くやしい', meaning_es: 'Frustrado / Con despecho', level: 'N3' },
          { kanji: '緊張', hiragana: 'きんちょう', meaning_es: 'Tensión nerviosa', level: 'N4' },
          { kanji: '涙ぐむ', hiragana: 'なみだぐむ', meaning_es: 'Llenarse los ojos de lágrimas', level: 'N3' }
        ]
      },
      {
        id: 'u8-l3-personalidad-caracter',
        title: 'Rasgos de personalidad y carácter',
        japanese_title: '性格・人柄・気質',
        description: 'Bondad, timidez, extroversión, sinceridad y firmeza moral',
        words: [
          { kanji: '優しい', hiragana: 'やさしい', meaning_es: 'Amable / Bondadoso', level: 'N5' },
          { kanji: '親切', hiragana: 'しんせつ', meaning_es: 'Atento / Servicial con los demás', level: 'N5' },
          { kanji: '明るい', hiragana: 'あかるい', meaning_es: 'Alegre / Optimista / Luminoso', level: 'N5' },
          { kanji: '静か', hiragana: 'しずか', meaning_es: 'Tranquilo / Reservado / Silencioso', level: 'N5' },
          { kanji: '厳しい', hiragana: 'きびしい', meaning_es: 'Estricto / Riguroso', level: 'N4' },
          { kanji: '真面目', hiragana: 'まじめ', meaning_es: 'Serio / Trabajador responsable', level: 'N4' },
          { kanji: '素直', hiragana: 'すなお', meaning_es: 'Dócil / Franco / Honesto de corazón', level: 'N3' },
          { kanji: '勇敢', hiragana: 'ゆうかん', meaning_es: 'Valiente / Intrépido', level: 'N3' },
          { kanji: '穏やか', hiragana: 'おだやか', meaning_es: 'Apacible / Sosegado', level: 'N3' },
          { kanji: '頑固', hiragana: 'がんこ', meaning_es: 'Testarudo / Obstinado', level: 'N3' }
        ]
      },
      {
        id: 'u8-l4-pensamiento-memoria',
        title: 'Pensamiento, memoria y opiniones',
        japanese_title: '思考・記憶・判断・意見',
        description: 'Creer, recordar, olvidar, reflexionar y tomar decisiones',
        words: [
          { kanji: '思う', hiragana: 'おもう', meaning_es: 'Pensar / Opinar / Creer', level: 'N5' },
          { kanji: '考える', hiragana: 'かんがえる', meaning_es: 'Reflexionar / Meditar', level: 'N5' },
          { kanji: '覚える', hiragana: 'おぼえる', meaning_es: 'Aprender de memoria / Recordar', level: 'N5' },
          { kanji: '忘れる', hiragana: 'わすれる', meaning_es: 'Olvidar', level: 'N5' },
          { kanji: '信じる', hiragana: 'しんじる', meaning_es: 'Creer en algo / Confiar', level: 'N4' },
          { kanji: '決める', hiragana: 'きめる', meaning_es: 'Decidir / Determinar una acción', level: 'N5' },
          { kanji: '理由', hiragana: 'りゆう', meaning_es: 'Razón / Motivo explicativo', level: 'N4' },
          { kanji: '意見', hiragana: 'いけん', meaning_es: 'Opinión expresada', level: 'N5' },
          { kanji: '記憶', hiragana: 'きおく', meaning_es: 'Memoria / Recuerdo mental', level: 'N4' },
          { kanji: '夢', hiragana: 'ゆめ', meaning_es: 'Sueño nocturno / Ilusión vital', level: 'N4' }
        ]
      },
      {
        id: 'u8-l5-musica-artes',
        title: 'Música, arte y espectáculos',
        japanese_title: '音楽・美術・舞台芸術',
        description: 'Instrumentos, canciones, pintura, fotografía y danza',
        words: [
          { kanji: '音楽', hiragana: 'おんがく', meaning_es: 'Música', level: 'N5' },
          { kanji: '歌', hiragana: 'うた', meaning_es: 'Canción', level: 'N5' },
          { kanji: '歌う', hiragana: 'うたう', meaning_es: 'Cantar', level: 'N5' },
          { kanji: 'ピアノ', hiragana: 'ぴあの', meaning_es: 'Piano acústico', level: 'N5' },
          { kanji: 'ギター', hiragana: 'ぎたー', meaning_es: 'Guitarra', level: 'N5' },
          { kanji: '絵', hiragana: 'え', meaning_es: 'Cuadro / Dibujo artístico', level: 'N5' },
          { kanji: '映画', hiragana: 'えいが', meaning_es: 'Película cinematográfica', level: 'N5' },
          { kanji: '写真', hiragana: 'しゃしん', meaning_es: 'Fotografía', level: 'N5' },
          { kanji: '演劇', hiragana: 'えんげき', meaning_es: 'Obra de teatro', level: 'N4' },
          { kanji: 'ダンス', hiragana: 'だんす', meaning_es: 'Baile / Danza artística', level: 'N5' }
        ]
      },
      {
        id: 'u8-l6-deportes-actividades',
        title: 'Deportes y actividades físicas',
        japanese_title: 'スポーツ・競技・運動',
        description: 'Fútbol, béisbol, natación, artes marciales y senderismo',
        words: [
          { kanji: 'スポーツ', hiragana: 'すぽーつ', meaning_es: 'Deporte en general', level: 'N5' },
          { kanji: 'サッカー', hiragana: 'さっかー', meaning_es: 'Fútbol asociación', level: 'N5' },
          { kanji: '野球', hiragana: 'やきゅう', meaning_es: 'Béisbol (deporte rey en Japón)', level: 'N5' },
          { kanji: 'テニス', hiragana: 'てにす', meaning_es: 'Tenis de raqueta', level: 'N5' },
          { kanji: '水泳', hiragana: 'すいえい', meaning_es: 'Natación deportiva', level: 'N5' },
          { kanji: '柔道', hiragana: 'じゅうどう', meaning_es: 'Arte marcial Judo', level: 'N4' },
          { kanji: '散歩', hiragana: 'さんぽ', meaning_es: 'Paseo relajante a pie', level: 'N5' },
          { kanji: '登山', hiragana: 'とざん', meaning_es: 'Montañismo / Escalada', level: 'N4' },
          { kanji: '釣り', hiragana: 'つり', meaning_es: 'Pesca recreativa', level: 'N4' },
          { kanji: 'キャンプ', hiragana: 'きゃんぷ', meaning_es: 'Campamento al aire libre', level: 'N4' }
        ]
      },
      {
        id: 'u8-l7-tradiciones-japonesas',
        title: 'Tradiciones y patrimonio japonés',
        japanese_title: '日本伝統・年中行事・和の文化',
        description: 'Festivales, templos, santuarios, ceremonia del té y aguas termales',
        words: [
          { kanji: '祭り', hiragana: 'まつり', meaning_es: 'Festival tradicional japonés (Matsuri)', level: 'N5' },
          { kanji: '寺', hiragana: 'てら', meaning_es: 'Templo budista', level: 'N5' },
          { kanji: '茶道', hiragana: 'さどう', meaning_es: 'Ceremonia del té tradicional (Sado)', level: 'N4' },
          { kanji: '華道', hiragana: 'かどう', meaning_es: 'Arte del arreglo floral (Ikebana / Kado)', level: 'N4' },
          { kanji: '歌舞伎', hiragana: 'かぶき', meaning_es: 'Teatro clásico Kabuki', level: 'N4' },
          { kanji: '相撲', hiragana: 'すもう', meaning_es: 'Lucha tradicional Sumo', level: 'N4' },
          { kanji: '浴衣', hiragana: 'ゆかた', meaning_es: 'Kimono ligero de algodón para verano', level: 'N4' },
          { kanji: '温泉', hiragana: 'おんせん', meaning_es: 'Baños de aguas termales naturales (Onsen)', level: 'N4' },
          { kanji: '盆栽', hiragana: 'ぼんさい', meaning_es: 'Árbol miniatura Bonsái', level: 'N4' },
          { kanji: '折り紙', hiragana: 'おりがみ', meaning_es: 'Papiroflexia Origami', level: 'N4' }
        ]
      }
    ]
  },

  // -----------------------------------------------------------------------
  // UNIDAD 10: Léxico Moderno y Vocabulario Digital en Katakana
  // -----------------------------------------------------------------------
  {
    id: 'unit-10-katakana-moderno',
    title: 'Unidad 10: Léxico Moderno y Vocabulario Digital en Katakana',
    japanese_title: '現代外来語・デジタル用語・カタカナ',
    subtitle: 'Tecnología digital, redes sociales, estilo de vida, eventos y tendencias globales',
    kanji_icon: 'カ',
    color: '#06b6d4',
    bg_gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    track: 'thematic',
    lessons: [
      {
        id: 'u9-l1-tecnologia-digital',
        title: 'Dispositivos, software e informática',
        japanese_title: 'IT・ソフトウェア・端末',
        description: 'Smartphones, aplicaciones móviles, descargas y navegación digital',
        words: [
          { kanji: 'スマホ', hiragana: 'すまほ', meaning_es: 'Teléfono inteligente / Smartphone', level: 'N4' },
          { kanji: 'アプリ', hiragana: 'あぷり', meaning_es: 'Aplicación informática / App', level: 'N4' },
          { kanji: 'ダウンロード', hiragana: 'だうんろーど', meaning_es: 'Descarga de archivos de red', level: 'N4' },
          { kanji: 'パスワード', hiragana: 'ぱすわーど', meaning_es: 'Contraseña de seguridad', level: 'N4' },
          { kanji: 'クリック', hiragana: 'くりっく', meaning_es: 'Pulsación de ratón / Clic', level: 'N4' },
          { kanji: 'オンライン', hiragana: 'おんらいん', meaning_es: 'En línea / Conectado a la red', level: 'N4' },
          { kanji: 'デジタル', hiragana: 'でじたる', meaning_es: 'Tecnología digital', level: 'N4' },
          { kanji: 'サイト', hiragana: 'さいと', meaning_es: 'Sitio o página web', level: 'N4' },
          { kanji: 'リンク', hiragana: 'りんく', meaning_es: 'Enlace web hipertexto', level: 'N4' },
          { kanji: '画面', hiragana: 'がめん', meaning_es: 'Pantalla de visualización', level: 'N4' }
        ]
      },
      {
        id: 'u9-l2-redes-comunicacion',
        title: 'Redes sociales y comunicación en red',
        japanese_title: 'SNS・ネットコミュニケーション',
        description: 'Mensajes, cuentas, perfiles, seguimiento y comentarios digitales',
        words: [
          { kanji: 'ブログ', hiragana: 'ぶろぐ', meaning_es: 'Bitácora web / Blog personal', level: 'N5' },
          { kanji: 'チャット', hiragana: 'ちゃっと', meaning_es: 'Conversación instantánea en chat', level: 'N4' },
          { kanji: 'メッセージ', hiragana: 'めっせーじ', meaning_es: 'Mensaje de texto digital', level: 'N4' },
          { kanji: 'シェア', hiragana: 'しぇあ', meaning_es: 'Compartir contenido con otros', level: 'N4' },
          { kanji: 'フォロー', hiragana: 'ふぉろー', meaning_es: 'Seguir una cuenta en redes', level: 'N4' },
          { kanji: 'コメント', hiragana: 'こめんと', meaning_es: 'Comentario u opinión escrita', level: 'N4' },
          { kanji: 'アカウント', hiragana: 'あかうんと', meaning_es: 'Cuenta de usuario digital', level: 'N4' },
          { kanji: 'プロフィール', hiragana: 'ぷろふぃーる', meaning_es: 'Perfil personal de usuario', level: 'N4' },
          { kanji: 'ニュース', hiragana: 'にゅーす', meaning_es: 'Noticias informativas de actualidad', level: 'N5' },
          { kanji: 'メディア', hiragana: 'めでぃあ', meaning_es: 'Medios de comunicación en masa', level: 'N4' }
        ]
      },
      {
        id: 'u9-l3-vida-urbana-cafeteria',
        title: 'Cafetería moderna y comida urbana',
        japanese_title: 'カフェ文化・ファストフード',
        description: 'Smoothies, lattes, comida para llevar y métodos de autoservicio',
        words: [
          { kanji: 'カフェラテ', hiragana: 'かふぇらて', meaning_es: 'Café con leche espresso / Latte', level: 'N4' },
          { kanji: 'スムージー', hiragana: 'すむーじー', meaning_es: 'Bebida batida de frutas / Smoothie', level: 'N4' },
          { kanji: 'サンドイッチ', hiragana: 'さんどいっち', meaning_es: 'Emparedado / Sándwich', level: 'N5' },
          { kanji: 'ベーカリー', hiragana: 'べーかりー', meaning_es: 'Panadería artesanal', level: 'N4' },
          { kanji: 'テイクアウト', hiragana: 'ていくあうと', meaning_es: 'Comida para llevar a casa', level: 'N4' },
          { kanji: 'セルフ', hiragana: 'せるふ', meaning_es: 'Sistema de autoservicio', level: 'N4' },
          { kanji: 'キャッシュレス', hiragana: 'きゃっしゅれす', meaning_es: 'Pago sin dinero en efectivo', level: 'N4' },
          { kanji: 'ランチ', hiragana: 'らんち', meaning_es: 'Almuerzo de mediodía', level: 'N4' },
          { kanji: 'モーニング', hiragana: 'もーにんぐ', meaning_es: 'Desayuno especial de cafetería matutino', level: 'N4' },
          { kanji: 'デザート', hiragana: 'でざーと', meaning_es: 'Postre dulce al final de la comida', level: 'N4' }
        ]
      },
      {
        id: 'u9-l4-compras-moda-moderna',
        title: 'Compras, tendencias y moda actual',
        japanese_title: 'ショッピング・トレンド・スタイル',
        description: 'Marcas, rebajas, tendencias, estilismos y diseño de ropa',
        words: [
          { kanji: 'ショッピング', hiragana: 'しょっぴんぐ', meaning_es: 'Ir de compras comerciales', level: 'N5' },
          { kanji: 'セール', hiragana: 'せーる', meaning_es: 'Rebajas de temporada / Liquidación', level: 'N4' },
          { kanji: 'ブランド', hiragana: 'ぶらんど', meaning_es: 'Marca comercial reconocida', level: 'N4' },
          { kanji: 'トレンド', hiragana: 'とれんど', meaning_es: 'Tendencia de moda actual', level: 'N4' },
          { kanji: 'デザイン', hiragana: 'でざいん', meaning_es: 'Diseño creativo y estético', level: 'N4' },
          { kanji: 'ファッション', hiragana: 'ふぁっしょん', meaning_es: 'Moda e indumentaria actual', level: 'N4' },
          { kanji: 'カジュアル', hiragana: 'かじゅある', meaning_es: 'Estilo informal y cómodo', level: 'N4' },
          { kanji: 'サイズ', hiragana: 'さいず', meaning_es: 'Talla de ropa o calzado', level: 'N5' },
          { kanji: 'スタイル', hiragana: 'すたいる', meaning_es: 'Estilo propio / Silueta corporal', level: 'N4' },
          { kanji: 'コーデ', hiragana: 'こーで', meaning_es: 'Combinación y conjunto de ropa', level: 'N4' }
        ]
      },
      {
        id: 'u9-l5-viajes-hotel-turismo',
        title: 'Viajes, alojamientos y turismo',
        japanese_title: '旅行・ホテル宿泊・観光',
        description: 'Hoteles, recepción, billetes turísticos, pasaporte y alquileres',
        words: [
          { kanji: 'ホテル', hiragana: 'ほてる', meaning_es: 'Hotel de alojamiento', level: 'N5' },
          { kanji: 'フロント', hiragana: 'ふろんと', meaning_es: 'Mostrador de recepción de hotel', level: 'N4' },
          { kanji: 'チェックイン', hiragana: 'ちぇっくいん', meaning_es: 'Registro de entrada en hotel', level: 'N4' },
          { kanji: 'ロビー', hiragana: 'ろびー', meaning_es: 'Vestíbulo principal / Sala de espera', level: 'N4' },
          { kanji: 'ツアー', hiragana: 'つあー', meaning_es: 'Viaje organizado / Excursión turística', level: 'N5' },
          { kanji: 'ガイド', hiragana: 'がいど', meaning_es: 'Guía turístico / Manual informativo', level: 'N4' },
          { kanji: 'リゾート', hiragana: 'りぞーと', meaning_es: 'Complejo vacacional de descanso', level: 'N4' },
          { kanji: 'チケット', hiragana: 'ちけっと', meaning_es: 'Entrada para espectáculo o viaje', level: 'N5' },
          { kanji: 'パスポート', hiragana: 'ぱすぽーと', meaning_es: 'Pasaporte para viajar al extranjero', level: 'N5' },
          { kanji: 'レンタカー', hiragana: 'れんたかー', meaning_es: 'Coche de alquiler turístico', level: 'N4' }
        ]
      },
      {
        id: 'u9-l6-ocio-espectaculos-vida',
        title: 'Ocio, eventos y entretenimiento moderno',
        japanese_title: 'エンタメ・イベント・ライフスタイル',
        description: 'Conciertos, eventos en vivo, karaoke, fitness y tiempo libre',
        words: [
          { kanji: 'コンサート', hiragana: 'こんさーと', meaning_es: 'Concierto musical en auditorio', level: 'N5' },
          { kanji: 'ライブ', hiragana: 'らいぶ', meaning_es: 'Música o actuación en directo', level: 'N4' },
          { kanji: 'イベント', hiragana: 'いべんと', meaning_es: 'Evento público o celebración especial', level: 'N4' },
          { kanji: 'ゲーム', hiragana: 'げーむ', meaning_es: 'Videojuego / Partida de juego', level: 'N5' },
          { kanji: 'カラオケ', hiragana: 'からおけ', meaning_es: 'Canto con pista instrumental Karaoke', level: 'N5' },
          { kanji: 'フィットネス', hiragana: 'ふぃっとねす', meaning_es: 'Entrenamiento físico en gimnasio', level: 'N4' },
          { kanji: 'リラックス', hiragana: 'りらっくす', meaning_es: 'Relajación y descanso corporal', level: 'N4' },
          { kanji: 'プライベート', hiragana: 'ぷらいべーと', meaning_es: 'Ámbito privado e íntimo', level: 'N4' },
          { kanji: 'リモート', hiragana: 'りもーと', meaning_es: 'Trabajo o actividad a distancia', level: 'N4' },
          { kanji: 'サプライズ', hiragana: 'さぷらいず', meaning_es: 'Sorpresa agradable no esperada', level: 'N4' }
        ]
      }
    ]
  }
];

// =========================================================================
// VALIDACIÓN Y VERIFICACIÓN MATEMÁTICA DE CERO DUPLICADOS
// =========================================================================

const seenWords = new Map();
const duplicatesFound = [];
let grandTotalWords = 0;
let grandTotalLessons = 0;

const cleanUnits = fusedUnitsDefinition.map(unit => {
  const processedLessons = unit.lessons.map((lesson, lIdx) => {
    grandTotalLessons++;
    const formattedWords = [];

    lesson.words.forEach(w => {
      const key = (w.kanji || w.hiragana).trim();
      if (seenWords.has(key)) {
        duplicatesFound.push({
          word: key,
          firstSeen: seenWords.get(key),
          duplicatedIn: `${unit.title} -> ${lesson.title}`
        });
      } else {
        seenWords.set(key, `${unit.title} -> ${lesson.title}`);
        const fw = formatWord(w, lesson.title);
        formattedWords.push(fw);
        grandTotalWords++;
      }
    });

    return {
      id: lesson.id,
      number: lIdx + 1,
      title: lesson.title,
      japanese_title: lesson.japanese_title || lesson.title,
      description: lesson.description || '',
      words: formattedWords
    };
  });

  return {
    ...unit,
    total_words: processedLessons.reduce((acc, l) => acc + l.words.length, 0),
    lessons_count: processedLessons.length,
    lessons: processedLessons
  };
});

if (duplicatesFound.length > 0) {
  console.error(`❌ ERROR CRÍTICO: Se encontraron ${duplicatesFound.length} palabras duplicadas:`);
  duplicatesFound.forEach(d => console.error(` - "${d.word}": primero en [${d.firstSeen}], repetido en [${d.duplicatedIn}]`));
  process.exit(1);
}

console.log('🎉 VERIFICACIÓN PERFECTA: CERO PALABRAS DUPLICADAS EN TODO EL PLAN DE ESTUDIOS.');
console.log(`Total Unidades Fusionadas: ${cleanUnits.length}`);
console.log(`Total Lecciones: ${grandTotalLessons}`);
console.log(`Total Palabras Únicas: ${grandTotalWords}`);

// Guardar data/scriptpad_units.json
fs.writeFileSync(scriptpadPath, JSON.stringify(cleanUnits, null, 2), 'utf8');
console.log('✅ data/scriptpad_units.json actualizado con la ruta única.');

// Sincronizar vocabulary.json
const allWordsList = [];
cleanUnits.forEach(u => u.lessons.forEach(l => l.words.forEach(w => allWordsList.push(w))));

const vocabMap = new Map();
vocabData.forEach(item => {
  const k = (item.kanji || item.word || item.hiragana || item.kana || '').trim();
  if (k) vocabMap.set(k, item);
});

let addedToVocab = 0;
allWordsList.forEach(w => {
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
  fs.writeFileSync(vocabPath, JSON.stringify(Array.from(vocabMap.values()), null, 2), 'utf8');
  console.log(`✅ ${addedToVocab} nuevas palabras sincronizadas en data/vocabulary.json.`);
}

// Sincronizar kanji.json
let kanjiSyncCount = 0;
kanjiData.forEach(kEntry => {
  const char = kEntry.kanji;
  if (!char) return;
  if (!Array.isArray(kEntry.words)) {
    kEntry.words = [];
  }

  allWordsList.forEach(w => {
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
