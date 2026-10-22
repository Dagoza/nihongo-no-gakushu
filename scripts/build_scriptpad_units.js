const fs = require('fs');
const path = require('path');
const wanakana = require('wanakana');

const vocabData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/vocabulary.json'), 'utf8'));
const dictData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/dictionary.json'), 'utf8'));
const curriculumData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/curriculum.json'), 'utf8'));

// Build indexed dictionary of all words
const wordLookup = new Map();
const usedWords = new Set();

function cleanWord(w) {
  const kanji = (w.kanji || '').trim();
  const hiragana = (w.hiragana || w.kana || '').trim();
  const rawKey = kanji || hiragana;
  if (!rawKey) return null;

  let katakana = (w.katakana || '').trim();
  if (!katakana && hiragana) {
    katakana = wanakana.toKatakana(hiragana);
  }
  let romaji = (w.romaji || '').trim();
  if (!romaji && hiragana) {
    romaji = wanakana.toRomaji(hiragana);
  }

  // Normalizar nivel estrictamente N5 a N1
  let level = (w.level || 'N5').toUpperCase().trim();
  if (!['N5', 'N4', 'N3', 'N2', 'N1'].includes(level)) {
    level = 'N5';
  }

  return {
    id: w.id || `sp_${rawKey}`,
    kanji: kanji || hiragana,
    hiragana: hiragana || (kanji && !wanakana.isKana(kanji) ? '' : kanji),
    katakana: katakana,
    romaji: romaji,
    meaning_es: w.meaning_es || w.translation || '',
    level: level,
    category: w.category || 'General',
    audio_url: w.audio_url || ''
  };
}

// Poblamos el lookup
[...vocabData, ...dictData].forEach(raw => {
  const cleaned = cleanWord(raw);
  if (!cleaned) return;
  const key = cleaned.kanji || cleaned.hiragana;
  if (!wordLookup.has(key)) {
    wordLookup.set(key, cleaned);
  }
});

// Helper para buscar o crear palabra si falta
function findOrCreateWord(item) {
  const key = typeof item === 'string' ? item : (item.kanji || item.hiragana || item.kana);
  usedWords.add(key);
  if (wordLookup.has(key)) {
    const existing = wordLookup.get(key);
    if (typeof item === 'object') {
      return {
        ...existing,
        ...item,
        hiragana: item.hiragana || existing.hiragana,
        meaning_es: item.meaning_es || existing.meaning_es
      };
    }
    return existing;
  }

  if (typeof item === 'object') {
    const created = cleanWord(item);
    wordLookup.set(key, created);
    return created;
  }

  // Si es un string simple, inferir hiragana/katakana
  const isKana = wanakana.isKana(key);
  const hiragana = isKana ? wanakana.toHiragana(key) : key;
  const katakana = wanakana.toKatakana(hiragana);
  const romaji = wanakana.toRomaji(hiragana);
  const fallback = {
    id: `sp_${key}`,
    kanji: key,
    hiragana: hiragana,
    katakana: katakana,
    romaji: romaji,
    meaning_es: key,
    level: 'N5',
    category: 'General',
    audio_url: ''
  };
  wordLookup.set(key, fallback);
  return fallback;
}

// -------------------------------------------------------------
// DEFINICIÓN DE LECCIONES DE "JAPANESE BASICS" (12 LECCIONES EXACTAS)
// -------------------------------------------------------------
const basicsLessons = [
  {
    id: 'basics-1-numbers-0-10',
    number: 1,
    title: 'Numbers 0–10',
    japanese_title: '数字 0〜10',
    description: 'Números básicos del 0 al 10 en kanji y lectura',
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
    id: 'basics-2-numbers-11-20',
    number: 2,
    title: 'Numbers 11–20',
    japanese_title: '数字 11〜20',
    description: 'Composición numérica del once al veinte',
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
    id: 'basics-3-big-numbers',
    number: 3,
    title: 'Big Numbers',
    japanese_title: '大きい数字・位',
    description: 'Decenas, centenas, millares y la moneda japonesa',
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
    id: 'basics-4-days-of-the-week',
    number: 4,
    title: 'Days of the Week',
    japanese_title: '曜日 (ようび)',
    description: 'Los 7 días de la semana y sus elementos naturales',
    words: [
      { kanji: '月曜日', hiragana: 'げつようび', meaning_es: 'Lunes (Día de la luna)', level: 'N5' },
      { kanji: '火曜日', hiragana: 'かようび', meaning_es: 'Martes (Día del fuego)', level: 'N5' },
      { kanji: '水曜日', hiragana: 'すいようび', meaning_es: 'Miércoles (Día del agua)', level: 'N5' },
      { kanji: '木曜日', hiragana: 'もくようび', meaning_es: 'Jueves (Día de la madera/árbol)', level: 'N5' },
      { kanji: '金曜日', hiragana: 'きんようび', meaning_es: 'Viernes (Día del oro/metal)', level: 'N5' },
      { kanji: '土曜日', hiragana: 'どようび', meaning_es: 'Sábado (Día de la tierra)', level: 'N5' },
      { kanji: '日曜日', hiragana: 'にちようび', meaning_es: 'Domingo (Día del sol)', level: 'N5' }
    ]
  },
  {
    id: 'basics-5-months-of-the-year',
    number: 5,
    title: 'Months of the Year',
    japanese_title: '月 (がつ)',
    description: 'Los doce meses del año calendario',
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
    id: 'basics-6-greetings-courtesy',
    number: 6,
    title: 'Greetings & Courtesy',
    japanese_title: '挨拶・丁寧な言葉',
    description: 'Saludos esenciales y fórmulas de cortesía cotidiana',
    words: [
      { kanji: 'おはよう', hiragana: 'おはよう', meaning_es: 'Buenos días (informal)', level: 'N5' },
      { kanji: 'こんにちは', hiragana: 'こんにちは', meaning_es: 'Hola / Buenas tardes', level: 'N5' },
      { kanji: 'こんばんは', hiragana: 'こんばんは', meaning_es: 'Buenas noches (saludo)', level: 'N5' },
      { kanji: 'ありがとう', hiragana: 'ありがとう', meaning_es: 'Gracias', level: 'N5' },
      { kanji: 'すみません', hiragana: 'すみません', meaning_es: 'Disculpe / Con permiso / Gracias', level: 'N5' },
      { kanji: 'さようなら', hiragana: 'さようなら', meaning_es: 'Adiós (despedida formal)', level: 'N5' },
      { kanji: 'お願いします', hiragana: 'おねがいします', meaning_es: 'Por favor', level: 'N5' },
      { kanji: 'はじめまして', hiragana: 'はじめまして', meaning_es: 'Mucho gusto (encantado)', level: 'N5' },
      { kanji: 'ごめんなさい', hiragana: 'ごめんなさい', meaning_es: 'Lo siento / Perdón', level: 'N5' },
      { kanji: 'じゃあまた', hiragana: 'じゃあまた', meaning_es: 'Hasta luego / Nos vemos', level: 'N5' }
    ]
  },
  {
    id: 'basics-7-foundational-words',
    number: 7,
    title: 'Foundational Words',
    japanese_title: '基本代名詞・応答',
    description: 'Pronombres demostrativos, personas y respuestas básicas',
    words: [
      { kanji: 'はい', hiragana: 'はい', meaning_es: 'Sí (afirmación cortés)', level: 'N5' },
      { kanji: 'いいえ', hiragana: 'いいえ', meaning_es: 'No (negación)', level: 'N5' },
      { kanji: 'これ', hiragana: 'これ', meaning_es: 'Esto (cerca del que habla)', level: 'N5' },
      { kanji: 'それ', hiragana: 'それ', meaning_es: 'Eso (cerca del oyente)', level: 'N5' },
      { kanji: 'あれ', hiragana: 'あれ', meaning_es: 'Aquello (lejos de ambos)', level: 'N5' },
      { kanji: 'どれ', hiragana: 'どれ', meaning_es: '¿Cuál?', level: 'N5' },
      { kanji: 'ここ', hiragana: 'ここ', meaning_es: 'Aquí (este lugar)', level: 'N5' },
      { kanji: 'そこ', hiragana: 'そこ', meaning_es: 'Ahí (ese lugar)', level: 'N5' },
      { kanji: 'あそこ', hiragana: 'あそこ', meaning_es: 'Allí / Allá (aquel lugar)', level: 'N5' },
      { kanji: 'どこ', hiragana: 'どこ', meaning_es: '¿Dónde? (interrogativo de lugar)', level: 'N5' },
      { kanji: '私', hiragana: 'わたし', meaning_es: 'Yo (primera persona)', level: 'N5' },
      { kanji: 'あなた', hiragana: 'あなた', meaning_es: 'Tú / Usted (segunda persona)', level: 'N5' }
    ]
  },
  {
    id: 'basics-8-colors',
    number: 8,
    title: 'Colors',
    japanese_title: '色 (いろ)',
    description: 'Colores principales y su forma nominal y adjetival',
    words: [
      { kanji: '赤', hiragana: 'あか', meaning_es: 'Rojo (sustantivo)', level: 'N5' },
      { kanji: '青', hiragana: 'あお', meaning_es: 'Azul (sustantivo)', level: 'N5' },
      { kanji: '白', hiragana: 'しろ', meaning_es: 'Blanco (sustantivo)', level: 'N5' },
      { kanji: '黒', hiragana: 'くろ', meaning_es: 'Negro (sustantivo)', level: 'N5' },
      { kanji: '黄色', hiragana: 'きいろ', meaning_es: 'Amarillo', level: 'N5' },
      { kanji: '緑', hiragana: 'みどり', meaning_es: 'Verde', level: 'N5' },
      { kanji: '茶色', hiragana: 'ちゃいろ', meaning_es: 'Marrón / Café', level: 'N5' },
      { kanji: '紫', hiragana: 'むらさき', meaning_es: 'Morado / Violeta', level: 'N4' },
      { kanji: '灰色', hiragana: 'はいいろ', meaning_es: 'Gris / Ceniza', level: 'N4' },
      { kanji: '色', hiragana: 'いろ', meaning_es: 'Color (concepto general)', level: 'N5' }
    ]
  },
  {
    id: 'basics-9-family',
    number: 9,
    title: 'Family',
    japanese_title: '家族 (かぞく)',
    description: 'Miembros nucleares de la familia',
    words: [
      { kanji: '家族', hiragana: 'かぞく', meaning_es: 'Familia', level: 'N5' },
      { kanji: '父', hiragana: 'ちち', meaning_es: 'Padre (mi padre)', level: 'N5' },
      { kanji: '母', hiragana: 'はは', meaning_es: 'Madre (mi madre)', level: 'N5' },
      { kanji: '両親', hiragana: 'りょうしん', meaning_es: 'Padres / Ambos progenitores', level: 'N5' },
      { kanji: '兄', hiragana: 'あに', meaning_es: 'Hermano mayor (mi hermano)', level: 'N5' },
      { kanji: '姉', hiragana: 'あね', meaning_es: 'Hermana mayor (mi hermana)', level: 'N5' },
      { kanji: '弟', hiragana: 'おとうと', meaning_es: 'Hermano menor', level: 'N5' },
      { kanji: '妹', hiragana: 'いもうと', meaning_es: 'Hermana menor', level: 'N5' },
      { kanji: '祖父', hiragana: 'そふ', meaning_es: 'Abuelo (mi abuelo)', level: 'N5' },
      { kanji: '祖母', hiragana: 'そぼ', meaning_es: 'Abuela (mi abuela)', level: 'N5' }
    ]
  },
  {
    id: 'basics-10-body-parts',
    number: 10,
    title: 'Body Parts',
    japanese_title: '体・顔の部分',
    description: 'Partes principales del cuerpo y del rostro',
    words: [
      { kanji: '目', hiragana: 'め', meaning_es: 'Ojo / Ojos', level: 'N5' },
      { kanji: '耳', hiragana: 'みみ', meaning_es: 'Oreja / Oído', level: 'N5' },
      { kanji: '口', hiragana: 'くち', meaning_es: 'Boca', level: 'N5' },
      { kanji: '手', hiragana: 'て', meaning_es: 'Mano', level: 'N5' },
      { kanji: '足', hiragana: 'あし', meaning_es: 'Pie / Pierna', level: 'N5' },
      { kanji: '頭', hiragana: 'あたま', meaning_es: 'Cabeza', level: 'N5' },
      { kanji: '顔', hiragana: 'かお', meaning_es: 'Cara / Rostro', level: 'N5' },
      { kanji: '鼻', hiragana: 'はな', meaning_es: 'Nariz', level: 'N5' },
      { kanji: '歯', hiragana: 'は', meaning_es: 'Diente / Dientes', level: 'N5' },
      { kanji: '指', hiragana: 'ゆび', meaning_es: 'Dedo', level: 'N5' }
    ]
  },
  {
    id: 'basics-11-food-basics',
    number: 11,
    title: 'Food Basics',
    japanese_title: '基本的な食べ物・飲み物',
    description: 'Alimentos e ingredientes fundamentales de uso diario',
    words: [
      { kanji: '水', hiragana: 'みず', meaning_es: 'Agua', level: 'N5' },
      { kanji: 'ご飯', hiragana: 'ごはん', meaning_es: 'Arroz cocido / Comida', level: 'N5' },
      { kanji: 'パン', hiragana: 'ぱん', meaning_es: 'Pan', level: 'N5' },
      { kanji: '肉', hiragana: 'にく', meaning_es: 'Carne', level: 'N5' },
      { kanji: '魚', hiragana: 'さかな', meaning_es: 'Pescado', level: 'N5' },
      { kanji: '野菜', hiragana: 'やさい', meaning_es: 'Verduras', level: 'N5' },
      { kanji: '果物', hiragana: 'くだもの', meaning_es: 'Fruta', level: 'N5' },
      { kanji: '卵', hiragana: 'たまご', meaning_es: 'Huevo', level: 'N5' },
      { kanji: 'お茶', hiragana: 'おちゃ', meaning_es: 'Té verde / Té', level: 'N5' },
      { kanji: '牛乳', hiragana: 'ぎゅうにゅう', meaning_es: 'Leche de vaca', level: 'N5' }
    ]
  },
  {
    id: 'basics-12-common-verbs',
    number: 12,
    title: 'Common Verbs',
    japanese_title: 'よく使う基本動詞',
    description: 'Verbos esenciales de acción diaria',
    words: [
      { kanji: '食べる', hiragana: 'たべる', meaning_es: 'Comer', level: 'N5' },
      { kanji: '飲む', hiragana: 'のむ', meaning_es: 'Beber / Tomar', level: 'N5' },
      { kanji: '行く', hiragana: 'いく', meaning_es: 'Ir', level: 'N5' },
      { kanji: '来る', hiragana: 'くる', meaning_es: 'Venir', level: 'N5' },
      { kanji: '見る', hiragana: 'みる', meaning_es: 'Ver / Mirar', level: 'N5' },
      { kanji: '聞く', hiragana: 'きく', meaning_es: 'Escuchar / Oír / Preguntar', level: 'N5' },
      { kanji: '話す', hiragana: 'はなす', meaning_es: 'Hablar', level: 'N5' },
      { kanji: '読む', hiragana: 'よむ', meaning_es: 'Leer', level: 'N5' },
      { kanji: '書く', hiragana: 'かく', meaning_es: 'Escribir', level: 'N5' },
      { kanji: '買う', hiragana: 'かう', meaning_es: 'Comprar', level: 'N5' }
    ]
  }
];

// Helper para particionar en lecciones de máximo 'size' palabras
function partitionIntoLessons(unitPrefix, unitTitle, lessonsPlan) {
  let counter = 1;
  const result = [];
  lessonsPlan.forEach(plan => {
    const rawWords = plan.words || [];
    const size = plan.chunkSize || 10;
    for (let i = 0; i < rawWords.length; i += size) {
      const chunk = rawWords.slice(i, i + size);
      const subTitle = rawWords.length > size ? `${plan.title} (${Math.floor(i / size) + 1})` : plan.title;
      result.push({
        id: `${unitPrefix}-lesson-${counter}`,
        number: counter,
        title: subTitle,
        japanese_title: plan.japanese_title || plan.title,
        description: plan.description || `${plan.title} en japonés`,
        words: chunk.map(w => findOrCreateWord(w))
      });
      counter++;
    }
  });
  return result;
}

// -------------------------------------------------------------
// DEFINICIÓN DE CONFIGURACIÓN DE UNIDADES TEMÁTICAS
// -------------------------------------------------------------
const thematicConfigs = [
  {
    id: 'unit-1',
    title: 'Unit 1: Animals, Colors & Body',
    japanese_title: '動物・色・身体',
    subtitle: 'Animals, Colors & Body anatomy',
    kanji_icon: '一',
    color: '#0284c7',
    bg_gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    track: 'thematic',
    targetCategories: ['Animales', 'Colores', 'Cuerpo', 'Cuerpo Humano', 'Salud']
  },
  {
    id: 'unit-2',
    title: 'Unit 2: Family, Daily Life & Home',
    japanese_title: '家族・日常生活・家',
    subtitle: 'Family, Daily Life & Home environment',
    kanji_icon: '二',
    color: '#f59e0b',
    bg_gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    track: 'thematic',
    targetCategories: ['Familia', 'Hogar', 'Vida Diaria', 'Vivienda', 'Electrodomésticos', 'Objetos']
  },
  {
    id: 'unit-3',
    title: 'Unit 3: Food & Drink',
    japanese_title: '飲食・日本料理・グルメ',
    subtitle: 'Food, Drinks & Japanese Gastronomy',
    kanji_icon: '三',
    color: '#10b981',
    bg_gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    track: 'thematic',
    targetCategories: ['Comida y Bebida', 'Comidas y Bebidas', 'Restaurante', 'Gastronomía', 'Comida', 'Cocina']
  },
  {
    id: 'unit-4',
    title: 'Unit 4: City, Transport & Shopping',
    japanese_title: '街・交通・買い物',
    subtitle: 'City, Transport & Shopping navigation',
    kanji_icon: '四',
    color: '#ef4444',
    bg_gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    track: 'thematic',
    targetCategories: ['Lugares', 'Transporte y Viajes', 'Transporte', 'Compras', 'Ciudad', 'Ropa', 'Posición', 'Direcciones']
  },
  {
    id: 'unit-5',
    title: 'Unit 5: Emotions, Work & Health',
    japanese_title: '感情・仕事・健康',
    subtitle: 'Emotions, Work, Professions & Health',
    kanji_icon: '五',
    color: '#06b6d4',
    bg_gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    track: 'thematic',
    targetCategories: ['Emociones', 'Sentimientos', 'Trabajo y Estudio', 'Trabajo', 'Personas y Profesiones', 'Oficina', 'Educación', 'Estudio']
  },
  {
    id: 'unit-6',
    title: 'Unit 6: Nature, Sports & Entertainment',
    japanese_title: '自然・スポーツ・娯楽',
    subtitle: 'Nature, Sports, Hobbies & Entertainment',
    kanji_icon: '六',
    color: '#a855f7',
    bg_gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    track: 'thematic',
    targetCategories: ['Naturaleza', 'Clima', 'Ocio', 'Aficiones', 'Ocio y Aficiones', 'Anime y Cultura', 'Cultura Pop', 'Cultura', 'Música']
  }
];

// Ensamblar todas las unidades
const unitsOutput = [];

// 1. Japanese Basics
unitsOutput.push({
  id: 'japanese-basics',
  title: 'Japanese Basics',
  japanese_title: '日本語の基礎',
  subtitle: 'Numbers, days, greetings & essential first words',
  kanji_icon: '基',
  color: '#8b5cf6',
  bg_gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
  track: 'basics',
  total_words: basicsLessons.reduce((acc, l) => acc + l.words.length, 0),
  lessons_count: basicsLessons.length,
  lessons: basicsLessons.map(l => ({
    ...l,
    words: l.words.map(w => findOrCreateWord(w))
  }))
});

// 2. Unidades temáticas con distribución enriquecida de palabras
thematicConfigs.forEach(cfg => {
  // Buscar palabras del diccionario que coincidan con sus categorías y aún no hayan sido usadas
  const matchingWords = [];
  wordLookup.forEach((w, key) => {
    if (cfg.targetCategories.includes(w.category)) {
      matchingWords.push(w);
    }
  });

  // Dividir en lecciones de 10 palabras
  const lessons = [];
  const chunkSize = 10;
  for (let i = 0; i < matchingWords.length; i += chunkSize) {
    const chunk = matchingWords.slice(i, i + chunkSize);
    const lessonNum = Math.floor(i / chunkSize) + 1;
    lessons.push({
      id: `${cfg.id}-lesson-${lessonNum}`,
      number: lessonNum,
      title: `${cfg.title.split(':')[1]?.trim() || cfg.title} - Parte ${lessonNum}`,
      japanese_title: `${cfg.japanese_title} 第${lessonNum}課`,
      description: `Lección ${lessonNum} de práctica de vocabulario y escritura para ${cfg.title}`,
      words: chunk.map(w => findOrCreateWord(w))
    });
  }

  unitsOutput.push({
    id: cfg.id,
    title: cfg.title,
    japanese_title: cfg.japanese_title,
    subtitle: cfg.subtitle,
    kanji_icon: cfg.kanji_icon,
    color: cfg.color,
    bg_gradient: cfg.bg_gradient,
    track: cfg.track,
    total_words: matchingWords.length,
    lessons_count: lessons.length,
    lessons: lessons
  });
});

// 3. Katakana Words Practice
const katakanaWords = [];
wordLookup.forEach((w) => {
  const isAllKata = wanakana.isKatakana(w.kanji) || (w.katakana && !w.kanji.match(/[\u4e00-\u9faf]/) && wanakana.isKatakana(w.katakana));
  if (isAllKata) {
    katakanaWords.push(w);
  }
});

const katakanaLessons = [];
const kChunkSize = 10;
for (let i = 0; i < katakanaWords.length; i += kChunkSize) {
  const chunk = katakanaWords.slice(i, i + kChunkSize);
  const lessonNum = Math.floor(i / kChunkSize) + 1;
  katakanaLessons.push({
    id: `unit-katakana-lesson-${lessonNum}`,
    number: lessonNum,
    title: `Préstamos Katakana (${lessonNum})`,
    japanese_title: `外来語・カタカナ (${lessonNum})`,
    description: `Palabras de origen extranjero y uso cotidiano en Katakana`,
    words: chunk.map(w => findOrCreateWord(w))
  });
}

unitsOutput.push({
  id: 'unit-katakana',
  title: 'Katakana Words Practice',
  japanese_title: 'カタカナ語マスター',
  subtitle: 'Common loanwords in Japanese',
  kanji_icon: 'カ',
  color: '#6366f1',
  bg_gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  track: 'katakana',
  total_words: katakanaWords.length,
  lessons_count: katakanaLessons.length,
  lessons: katakanaLessons
});

// Guardar data/scriptpad_units.json
fs.writeFileSync(
  path.join(__dirname, '../data/scriptpad_units.json'),
  JSON.stringify(unitsOutput, null, 2),
  'utf8'
);

console.log('✅ scriptpad_units.json generado exitosamente.');
console.log('Unidades creadas:', unitsOutput.length);
let grandTotalWords = 0;
unitsOutput.forEach(u => {
  grandTotalWords += u.total_words;
  console.log(`- [${u.kanji_icon}] ${u.title}: ${u.lessons_count} lecciones, ${u.total_words} palabras`);
});
console.log('TOTAL PALABRAS EN SCRIPTPAD:', grandTotalWords);
