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
const currentUnits = JSON.parse(fs.readFileSync(scriptpadPath, 'utf8'));

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

// -------------------------------------------------------------
// DICCIONARIOS DE EXPANSIÓN Y NUEVAS LECCIONES
// -------------------------------------------------------------

// Expansiones para lecciones existentes (añadir sin duplicar)
const wordExpansions = {
  // Unidad 1
  'u1-l4-ordinales-fracciones': [
    { kanji: '第二', hiragana: 'だいに', meaning_es: 'Segundo / Número dos', level: 'N4' },
    { kanji: '第三', hiragana: 'だいさん', meaning_es: 'Tercero / Número tres', level: 'N4' },
    { kanji: '第四', hiragana: 'だいよん', meaning_es: 'Cuarto / Número cuatro', level: 'N4' },
    { kanji: '第五', hiragana: 'だいご', meaning_es: 'Quinto / Número cinco', level: 'N4' },
    { kanji: '一番目', hiragana: 'いちばんめ', meaning_es: 'El primer lugar', level: 'N5' },
    { kanji: '三番目', hiragana: 'さんばんめ', meaning_es: 'Tercero en turno', level: 'N5' },
    { kanji: '五分の一', hiragana: 'ごぶんのいち', meaning_es: 'Un quinto (1/5)', level: 'N4' },
    { kanji: '二倍', hiragana: 'にばい', meaning_es: 'El doble (2x)', level: 'N4' },
    { kanji: '三倍', hiragana: 'さんばい', meaning_es: 'El triple (3x)', level: 'N4' }
  ],
  'u1-l5-matematicas-cantidades': [
    { kanji: '足し算', hiragana: 'たしざん', meaning_es: 'Suma', level: 'N4' },
    { kanji: '引き算', hiragana: 'ひきざん', meaning_es: 'Resta', level: 'N4' },
    { kanji: '掛け算', hiragana: 'かけざん', meaning_es: 'Multiplicación', level: 'N4' },
    { kanji: '割り算', hiragana: 'わりざん', meaning_es: 'División', level: 'N4' },
    { kanji: '平均', hiragana: 'へいきん', meaning_es: 'Promedio / Media', level: 'N3' },
    { kanji: '多数', hiragana: 'たすう', meaning_es: 'Mayoría / Gran cantidad', level: 'N3' },
    { kanji: '少数', hiragana: 'しょうすう', meaning_es: 'Minoría / Cantidad pequeña', level: 'N3' },
    { kanji: '十分', hiragana: 'じゅうぶん', meaning_es: 'Suficiente / Bastante', level: 'N4' },
    { kanji: '不足', hiragana: 'ふそく', meaning_es: 'Insuficiente / Falta', level: 'N4' },
    { kanji: '測る', hiragana: 'はかる', meaning_es: 'Medir', level: 'N4' },
    { kanji: '重さ', hiragana: 'おもさ', meaning_es: 'Peso', level: 'N4' },
    { kanji: '長さ', hiragana: 'ながさ', meaning_es: 'Longitud', level: 'N4' }
  ],
  'u1-l9-horas-minutos-periodos': [
    { kanji: '正午', hiragana: 'しょうご', meaning_es: 'Mediodía exacto', level: 'N4' },
    { kanji: '真夜中', hiragana: 'まよなか', meaning_es: 'Medianoche', level: 'N4' }
  ],
  // Unidad 2
  'u2-l2-animales-salvajes': [
    { kanji: '豹', hiragana: 'ひょう', meaning_es: 'Leopardo', level: 'N3' },
    { kanji: '縞馬', hiragana: 'しまうま', meaning_es: 'Cebra', level: 'N4' },
    { kanji: 'カバ', hiragana: 'かば', meaning_es: 'Hipopótamo', level: 'N4' },
    { kanji: 'サイ', hiragana: 'さい', meaning_es: 'Rinoceronte', level: 'N4' },
    { kanji: 'ゴリラ', hiragana: 'ごりら', meaning_es: 'Gorila', level: 'N5' },
    { kanji: 'チーター', hiragana: 'ちーたー', meaning_es: 'Guepardo', level: 'N4' },
    { kanji: '白熊', hiragana: 'しろくま', meaning_es: 'Oso polar', level: 'N4' },
    { kanji: 'コアラ', hiragana: 'こあら', meaning_es: 'Koala', level: 'N5' }
  ],
  'u2-l3-animales-granja': [
    { kanji: '雄牛', hiragana: 'おうし', meaning_es: 'Toro', level: 'N4' },
    { kanji: 'ロバ', hiragana: 'ろば', meaning_es: 'Burro / Asno', level: 'N4' },
    { kanji: '七面鳥', hiragana: 'しちめんちょう', meaning_es: 'Pavo', level: 'N3' },
    { kanji: '仔馬', hiragana: 'こうま', meaning_es: 'Potro / Cría de caballo', level: 'N4' }
  ],
  'u2-l4-aves-pajaros': [
    { kanji: 'ペンギン', hiragana: 'ぺんぎん', meaning_es: 'Pingüino', level: 'N5' },
    { kanji: '鶴', hiragana: 'つる', meaning_es: 'Grulla', level: 'N4' },
    { kanji: '鴎', hiragana: 'かもめ', meaning_es: 'Gaviota', level: 'N3' },
    { kanji: '梟', hiragana: 'ふくろう', meaning_es: 'Búho', level: 'N4' },
    { kanji: '雉', hiragana: 'きじ', meaning_es: 'Faisán', level: 'N3' },
    { kanji: 'オウム', hiragana: 'おうむ', meaning_es: 'Loro', level: 'N3' }
  ],
  'u2-l5-criaturas-marinas': [
    { kanji: '海亀', hiragana: 'うみがめ', meaning_es: 'Tortuga marina', level: 'N4' },
    { kanji: 'クラゲ', hiragana: 'くらげ', meaning_es: 'Medusa', level: 'N4' },
    { kanji: '浅蜊', hiragana: 'あさり', meaning_es: 'Almeja', level: 'N4' }
  ],
  'u2-l6-insectos-bichos': [
    { kanji: 'トンボ', hiragana: 'とんぼ', meaning_es: 'Libélula', level: 'N4' },
    { kanji: 'コオロギ', hiragana: 'こおろぎ', meaning_es: 'Grillo', level: 'N4' },
    { kanji: 'カマキリ', hiragana: 'かまきり', meaning_es: 'Mantis religiosa', level: 'N4' },
    { kanji: 'テントウムシ', hiragana: 'てんとうむし', meaning_es: 'Mariquita', level: 'N4' },
    { kanji: 'ムカデ', hiragana: 'むかで', meaning_es: 'Ciempiés', level: 'N3' },
    { kanji: '毛虫', hiragana: 'けむし', meaning_es: 'Oruga', level: 'N4' },
    { kanji: '蚤', hiragana: 'のみ', meaning_es: 'Pulga', level: 'N3' }
  ],
  'u2-l7-reptiles-anfibios': [
    { kanji: '毒蛇', hiragana: 'どくへび', meaning_es: 'Serpiente venenosa', level: 'N4' },
    { kanji: 'カメレオン', hiragana: 'かめれおん', meaning_es: 'Camaleón', level: 'N4' }
  ],
  'u2-l8-colores-principales': [
    { kanji: '金色', hiragana: 'きんいろ', meaning_es: 'Color dorado', level: 'N4' },
    { kanji: '銀色', hiragana: 'ぎんいろ', meaning_es: 'Color plateado', level: 'N4' },
    { kanji: '水色', hiragana: 'みずいろ', meaning_es: 'Celeste / Azul claro', level: 'N4' },
    { kanji: '紺色', hiragana: 'こんいろ', meaning_es: 'Azul marino', level: 'N4' }
  ],
  'u2-l9-formas-dimensiones': [
    { kanji: '星形', hiragana: 'ほしがた', meaning_es: 'Forma de estrella', level: 'N4' },
    { kanji: '円形', hiragana: 'えんけい', meaning_es: 'Forma circular', level: 'N3' },
    { kanji: '楕円', hiragana: 'だえん', meaning_es: 'Elipse / Óvalo', level: 'N3' },
    { kanji: '立方体', hiragana: 'りっぽうたい', meaning_es: 'Cubo geométrico', level: 'N3' }
  ],
  // Unidad 3
  'u3-l1-cabeza-rostro': [
    { kanji: 'こめかみ', hiragana: 'こめかみ', meaning_es: 'Sien', level: 'N3' },
    { kanji: '唇', hiragana: 'くちびる', meaning_es: 'Labios', level: 'N3' }
  ],
  'u3-l2-ojos-orejas-boca': [
    { kanji: '睫毛', hiragana: 'まつげ', meaning_es: 'Pestaña', level: 'N3' },
    { kanji: '瞳', hiragana: 'ひとみ', meaning_es: 'Pupila', level: 'N3' }
  ],
  'u3-l3-brazos-manos': [
    { kanji: '拳', hiragana: 'こぶし', meaning_es: 'Puño', level: 'N3' },
    { kanji: '手の平', hiragana: 'てのひら', meaning_es: 'Palma de la mano', level: 'N3' },
    { kanji: '脇の下', hiragana: 'わきのした', meaning_es: 'Axila', level: 'N3' }
  ],
  'u3-l4-piernas-pies-tronco': [
    { kanji: '踵', hiragana: 'かかと', meaning_es: 'Talón', level: 'N3' },
    { kanji: 'つま先', hiragana: 'つまさき', meaning_es: 'Punta del pie', level: 'N3' },
    { kanji: '太もも', hiragana: 'ふともも', meaning_es: 'Muslo', level: 'N3' },
    { kanji: '脛', hiragana: 'すね', meaning_es: 'Espinilla', level: 'N3' }
  ],
  'u3-l5-organos-fisiologia': [
    { kanji: '肺', hiragana: 'はい', meaning_es: 'Pulmón', level: 'N3' },
    { kanji: '肝臓', hiragana: 'かんぞう', meaning_es: 'Hígado', level: 'N3' },
    { kanji: '腎臓', hiragana: 'じんぞう', meaning_es: 'Riñón', level: 'N3' },
    { kanji: '腸', hiragana: 'ちょう', meaning_es: 'Intestino', level: 'N3' }
  ],
  // Unidad 4
  'u4-l1-familia-inmediata': [
    { kanji: 'ご主人', hiragana: 'ごしゅじん', meaning_es: 'Esposo ajeno', level: 'N5' },
    { kanji: '奥さん', hiragana: 'おくさん', meaning_es: 'Esposa ajena', level: 'N5' }
  ],
  'u4-l2-hermanos-abuelos': [
    { kanji: '親戚', hiragana: 'しんせき', meaning_es: 'Parientes / Familiares', level: 'N3' },
    { kanji: '甥', hiragana: 'おい', meaning_es: 'Sobrino', level: 'N3' },
    { kanji: '従兄弟', hiragana: 'いとこ', meaning_es: 'Primo / Prima', level: 'N4' },
    { kanji: '孫', hiragana: 'まご', meaning_es: 'Nieto / Nieta', level: 'N4' }
  ],
  'u4-l6-ropa-prendas': [
    { kanji: 'Tシャツ', hiragana: 'てぃーしゃつ', meaning_es: 'Camiseta', level: 'N5' },
    { kanji: 'ワンピース', hiragana: 'わんぴーす', meaning_es: 'Vestido enterizo', level: 'N4' },
    { kanji: 'ジャケット', hiragana: 'じゃけっと', meaning_es: 'Chaqueta', level: 'N5' },
    { kanji: 'ポケット', hiragana: 'ぽけっと', meaning_es: 'Bolsillo', level: 'N5' },
    { kanji: 'ボタン', hiragana: 'ぼたん', meaning_es: 'Botón', level: 'N5' },
    { kanji: 'ファスナー', hiragana: 'ふぁすなー', meaning_es: 'Cremallera', level: 'N4' }
  ]
};

// Nuevas lecciones a incorporar
const newLessonsByUnit = {
  // Unidad 2: Se agrega Lección 12: Texturas y superficies
  'unit-2-animales-naturaleza': [
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
    }
  ],

  // Unidad 4: Se agregan lecciones completas del hogar, mantenimiento, herramientas, bebé y complementos
  'unit-4-familia-hogar': [
    {
      id: 'u4-l10-estructura-vivienda',
      title: 'Estructura de la vivienda',
      japanese_title: '家の構造・建築',
      description: 'Tejados, paredes, techos, suelos, escaleras y elementos constructivos',
      words: [
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
        { kanji: '庭', hiragana: 'にわ', meaning_es: 'Jardín / Patio', level: 'N5' },
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
        { kanji: '絵画', hiragana: 'かいが', meaning_es: 'Cuadro / Pintura decorativa', level: 'N3' },
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
        { kanji: 'パジャマ', hiragana: 'ぱじゃま', meaning_es: 'Pijama para dormir', level: 'N5' }
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
        { kanji: 'シャワー', hiragana: 'しゃわー', meaning_es: 'Ducha', level: 'N5' },
        { kanji: '洗面台', hiragana: 'せんめんだい', meaning_es: 'Lavabo / Tocador', level: 'N4' },
        { kanji: 'タオル', hiragana: 'たおる', meaning_es: 'Toalla', level: 'N5' },
        { kanji: '石鹸', hiragana: 'せっけん', meaning_es: 'Jabón de manos / cuerpo', level: 'N5' },
        { kanji: 'シャンプー', hiragana: 'しゃんぷー', meaning_es: 'Champú', level: 'N5' },
        { kanji: 'リンス', hiragana: 'りんす', meaning_es: 'Acondicionador de pelo', level: 'N4' },
        { kanji: '歯ブラシ', hiragana: 'はぶらし', meaning_es: 'Cepillo de dientes', level: 'N4' },
        { kanji: '歯磨き粉', hiragana: 'はみがきこ', meaning_es: 'Pasta dentífrica', level: 'N4' },
        { kanji: '剃刀', hiragana: 'かみそり', meaning_es: 'Maquinilla de afeitar', level: 'N4' },
        { kanji: '鏡', hiragana: 'かがみ', meaning_es: 'Espejo', level: 'N4' },
        { kanji: 'バスマット', hiragana: 'ばすまっと', meaning_es: 'Alfombrilla de baño', level: 'N4' },
        { kanji: '湯船', hiragana: 'ゆぶね', meaning_es: 'Tina / Bañera con agua caliente', level: 'N3' },
        { kanji: 'トイレットペーパー', hiragana: 'といれっとぺーぱー', meaning_es: 'Papel higiénico', level: 'N4' },
        { kanji: 'ドライヤー', hiragana: 'どらいやー', meaning_es: 'Secador de pelo', level: 'N4' },
        { kanji: 'スポンジ', hiragana: 'すぽんじ', meaning_es: 'Esponja de aseo', level: 'N4' },
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
        { kanji: 'リップ', hiragana: 'りっぷ', meaning_es: 'Bálsamo labial', level: 'N4' },
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
  ],

  // Unidad 5: Se agregan lecciones completas de cocina, comedor, vajilla, electrodomésticos, utensilios y cocina activa
  'unit-5-comida-gastronomia': [
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
        { kanji: '水道', hiragana: 'すいどう', meaning_es: 'Suministro de agua / Grifo', level: 'N5' },
        { kanji: '蛇口', hiragana: 'じゃぐち', meaning_es: 'Grifo', level: 'N4' },
        { kanji: '調理台', hiragana: 'ちょうりだい', meaning_es: 'Encimera de cocina', level: 'N4' },
        { kanji: '食器棚', hiragana: 'しょっきだな', meaning_es: 'Alacena / Armario de platos', level: 'N4' },
        { kanji: '換気扇', hiragana: 'かんきせん', meaning_es: 'Extractor de humos / Ventilador', level: 'N4' },
        { kanji: '水切りかご', hiragana: 'みずきりかご', meaning_es: 'Escurridor de platos', level: 'N4' },
        { kanji: 'パントリー', hiragana: 'ぱんとりー', meaning_es: 'Despensa', level: 'N4' },
        { kanji: '冷凍庫', hiragana: 'れいとうこ', meaning_es: 'Congelador', level: 'N4' },
        { kanji: 'ゴミ箱', hiragana: 'ごみばこ', meaning_es: 'Cubo de basura de cocina', level: 'N5' }
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
    }
  ]
};

// -------------------------------------------------------------
// PROCESAMIENTO Y COMBINACIÓN
// -------------------------------------------------------------

const allCompiledWords = [];

const updatedUnits = currentUnits.map(unit => {
  const processedLessons = [];

  // 1. Procesar lecciones existentes del unit
  (unit.lessons || []).forEach(lesson => {
    const existingWords = [...(lesson.words || [])];
    const existingWordKeys = new Set(existingWords.map(w => (w.kanji || w.hiragana).trim()));

    // Añadir palabras expandidas si las hay
    const expansionList = wordExpansions[lesson.id] || [];
    expansionList.forEach(rawW => {
      const k = (rawW.kanji || rawW.hiragana).trim();
      if (!existingWordKeys.has(k)) {
        existingWords.push(formatWord(rawW, lesson.title));
        existingWordKeys.add(k);
      }
    });

    const formattedWords = existingWords.map(w => {
      const fw = formatWord(w, lesson.title);
      allCompiledWords.push(fw);
      return fw;
    });

    processedLessons.push({
      id: lesson.id,
      number: lesson.number,
      title: lesson.title,
      japanese_title: lesson.japanese_title || lesson.title,
      description: lesson.description || '',
      words: formattedWords
    });
  });

  // 2. Incorporar nuevas lecciones si aplican a este unit
  const newLessonsForThisUnit = newLessonsByUnit[unit.id] || [];
  newLessonsForThisUnit.forEach(newLessonDef => {
    // Verificar si ya existía para no duplicar
    if (!processedLessons.some(l => l.id === newLessonDef.id)) {
      const formattedWords = newLessonDef.words.map(w => {
        const fw = formatWord(w, newLessonDef.title);
        allCompiledWords.push(fw);
        return fw;
      });

      processedLessons.push({
        id: newLessonDef.id,
        number: processedLessons.length + 1,
        title: newLessonDef.title,
        japanese_title: newLessonDef.japanese_title || newLessonDef.title,
        description: newLessonDef.description || '',
        words: formattedWords
      });
    }
  });

  // Re-enumerar lecciones de forma continua y calcular total de palabras
  processedLessons.forEach((l, idx) => {
    l.number = idx + 1;
  });

  const totalWords = processedLessons.reduce((acc, l) => acc + l.words.length, 0);

  return {
    ...unit,
    total_words: totalWords,
    lessons_count: processedLessons.length,
    lessons: processedLessons
  };
});

// Guardar data/scriptpad_units.json
fs.writeFileSync(scriptpadPath, JSON.stringify(updatedUnits, null, 2), 'utf8');
console.log('✅ data/scriptpad_units.json actualizado exitosamente.');
console.log(`Total Unidades: ${updatedUnits.length}`);

let grandTotalWords = 0;
let grandTotalLessons = 0;
updatedUnits.forEach(u => {
  grandTotalWords += u.total_words;
  grandTotalLessons += u.lessons_count;
  console.log(`- [${u.kanji_icon}] ${u.title}: ${u.lessons_count} lecciones, ${u.total_words} palabras`);
});
console.log(`TOTAL LECCIONES: ${grandTotalLessons}`);
console.log(`TOTAL PALABRAS EN SCRIPTPAD: ${grandTotalWords}`);

// -------------------------------------------------------------
// SINCRONIZACIÓN CON data/vocabulary.json y data/kanji.json (Reglas 1 y 2)
// -------------------------------------------------------------

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
