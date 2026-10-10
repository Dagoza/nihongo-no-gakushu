/**
 * scripts/m1_data/curriculum_kanji_jukugo.js
 * Catálogo completo y sistemático de Kanjis y Combinaciones (Jukugo)
 * para los 69 pasos de contenido temático en data/curriculum.json (Feature 3).
 */

const KANJI_JUKUGO_CATALOG = {
  // === MÓDULO 1 ===
  '1_1': [
    {
      kanji: '先生',
      kana: 'せんせい',
      meaning: 'Profesor / Maestro / Nacido antes',
      onyomi: 'SEN, SEI [せん, せい]',
      kunyomi: 'saki, u(mareru) [さき, う(まれる)]',
      type: 'Jukugo',
      breakdown: [
        { char: '先', reading: 'せん', meaning: 'antes / previo' },
        { char: '生', reading: 'せい', meaning: 'nacido / vida' }
      ],
      breakdown_text: '先 (antes) + 生 (nacer) → "aquel que nació antes; quien precede en el camino de la vida y el conocimiento"',
      mnemonic: 'El maestro caminó antes guiando el sendero que ahora tú recorres.'
    }
  ],
  '1_2': [
    {
      kanji: '学生',
      kana: 'がくせい',
      meaning: 'Estudiante / Alumno',
      onyomi: 'GAKU, SEI [がく, せい]',
      kunyomi: 'mana(bu), i(kiru) [まな(ぶ), い(きる)]',
      type: 'Jukugo',
      breakdown: [
        { char: '学', reading: 'がく', meaning: 'estudio / aprender' },
        { char: '生', reading: 'せい', meaning: 'estudiante / vida' }
      ],
      breakdown_text: '学 (estudiar) + 生 (vida / aprendiz) → "aquel cuya vida y ocupación es aprender"',
      mnemonic: 'Bajo el tejado de la escuela, el niño aprende con ojos despiertos.'
    },
    {
      kanji: '私',
      kana: 'わたし',
      meaning: 'Yo / Mí mismo (primera persona)',
      onyomi: 'SHI [し]',
      kunyomi: 'watashi, watakushi [わたし, わたくし]',
      type: 'Kanji',
      breakdown: [
        { char: '私', reading: 'わたし', meaning: 'yo / personal' }
      ],
      breakdown_text: 'Radical 禾 (espiga de grano) + ム (brazo replegado hacia sí) → "cosecha privada; lo propio de uno mismo"',
      mnemonic: 'Abrazo mi propia gavilla de trigo: esto representa mi identidad personal.'
    }
  ],
  '1_3': [
    {
      kanji: '日本',
      kana: 'にほん',
      meaning: 'Japón / El origen del Sol',
      onyomi: 'NICHI, HON [にち, ほん]',
      kunyomi: 'hi, moto [ひ, もと]',
      type: 'Jukugo',
      breakdown: [
        { char: '日', reading: 'に', meaning: 'sol / día' },
        { char: '本', reading: 'ほん', meaning: 'origen / raíz' }
      ],
      breakdown_text: '日 (sol) + 本 (raíz / origen) → "la tierra donde nace el sol matutino"',
      mnemonic: 'El sol brillante se eleva directamente desde la raíz del árbol oriental.'
    },
    {
      kanji: '日本人',
      kana: 'にほんじん',
      meaning: 'Persona japonesa / Ciudadano de Japón',
      onyomi: 'NICHI, HON, JIN [にち, ほん, じん]',
      kunyomi: 'hito [ひと]',
      type: 'Jukugo',
      breakdown: [
        { char: '日本', reading: 'にほん', meaning: 'Japón' },
        { char: '人', reading: 'じん', meaning: 'persona / gentilicio' }
      ],
      breakdown_text: '日本 (Japón) + 人 (persona) → "persona originaria de la nación del sol naciente"',
      mnemonic: 'Dos piernas firmes sobre la tierra identifican a la persona que pertenece a esa nación.'
    }
  ],

  // === MÓDULO 2 ===
  '2_1': [
    {
      kanji: '日本語',
      kana: 'にほんご',
      meaning: 'Idioma japonés',
      onyomi: 'NICHI, HON, GO [にち, ほん, ご]',
      kunyomi: 'kata(ru) [かた(る)]',
      type: 'Jukugo',
      breakdown: [
        { char: '日本', reading: 'にほん', meaning: 'Japón' },
        { char: '語', reading: 'ご', meaning: 'palabra / idioma' }
      ],
      breakdown_text: '日本 (Japón) + 語 (lenguaje) → "lengua hablada y escrita de Japón"',
      mnemonic: '言 (palabras) + 五 (cinco) + 口 (boca): las palabras sabias que brotan de la boca forman el idioma.'
    },
    {
      kanji: '英語',
      kana: 'えいご',
      meaning: 'Idioma inglés',
      onyomi: 'EI, GO [えい, ご]',
      kunyomi: 'sugu(reru) [すぐ(れる)]',
      type: 'Jukugo',
      breakdown: [
        { char: '英', reading: 'えい', meaning: 'excelente / Inglaterra' },
        { char: '語', reading: 'ご', meaning: 'lengua / idioma' }
      ],
      breakdown_text: '英 (excelente / Inglaterra) + 語 (lengua) → "idioma originario de las Islas Británicas"',
      mnemonic: 'Una corona de hierba floreciente representa la distinción de una lengua global.'
    }
  ],

  // === MÓDULO 3 ===
  '3_1': [
    {
      kanji: '住所',
      kana: 'じゅうしょ',
      meaning: 'Dirección / Domicilio / Residencia',
      onyomi: 'JUU, SHO [じゅう, しょ]',
      kunyomi: 'su(mu), tokoro [す(む), ところ]',
      type: 'Jukugo',
      breakdown: [
        { char: '住', reading: 'じゅう', meaning: 'habitar / residir' },
        { char: '所', reading: 'しょ', meaning: 'lugar' }
      ],
      breakdown_text: '住 (vivir) + 所 (lugar) → "lugar físico donde reside una persona"',
      mnemonic: 'イ (persona) + 主 (dueño / amo): la persona se establece como dueña de su hogar.'
    },
    {
      kanji: '電話',
      kana: 'でんわ',
      meaning: 'Teléfono / Llamada telefónica',
      onyomi: 'DEN, WA [でん, わ]',
      kunyomi: 'hana(su) [はな(す)]',
      type: 'Jukugo',
      breakdown: [
        { char: '電', reading: 'でん', meaning: 'electricidad' },
        { char: '話', reading: 'わ', meaning: 'hablar / conversación' }
      ],
      breakdown_text: '電 (electricidad) + 話 (conversar) → "conversación transmitida a través de corriente eléctrica"',
      mnemonic: 'El relámpago en la tormenta (電) transporta la voz y las palabras (話) a la distancia.'
    }
  ],
  '3_2': [
    {
      kanji: '家族',
      kana: 'かぞく',
      meaning: 'Familia',
      onyomi: 'KA, ZOKU [か, ぞく]',
      kunyomi: 'ie, ya [いえ, や]',
      type: 'Jukugo',
      breakdown: [
        { char: '家', reading: 'か', meaning: 'casa / hogar' },
        { char: '族', reading: 'ぞく', meaning: 'tribu / clan' }
      ],
      breakdown_text: '家 (casa) + 族 (clan) → "el clan que convive y comparte la misma casa"',
      mnemonic: 'Bajo el tejado (宀) descansa la abundancia del hogar reunida bajo un mismo estandarte.'
    },
    {
      kanji: '父母',
      kana: 'ふぼ',
      meaning: 'Padre y madre / Progenitores',
      onyomi: 'FU, BO [ふ, ぼ]',
      kunyomi: 'chichi, haha [ちち, はは]',
      type: 'Jukugo',
      breakdown: [
        { char: '父', reading: 'ふ', meaning: 'padre' },
        { char: '母', reading: 'ぼ', meaning: 'madre' }
      ],
      breakdown_text: '父 (padre que empuña la vara guía) + 母 (madre nutricia que amamanta) → "ambos progenitores"',
      mnemonic: 'El padre sostiene la disciplina mientras la madre entrega el afecto con dos puntos de ternura.'
    }
  ],

  // === MÓDULO 4 ===
  '4_1': [
    {
      kanji: '食事',
      kana: 'しょくじ',
      meaning: 'Comida / Alimentación / Acto de comer',
      onyomi: 'SHOKU, JI [しょく, じ]',
      kunyomi: 'ta(beru), koto [た(べる), こと]',
      type: 'Jukugo',
      breakdown: [
        { char: '食', reading: 'しょく', meaning: 'comer / alimento' },
        { char: '事', reading: 'じ', meaning: 'asunto / evento' }
      ],
      breakdown_text: '食 (alimento) + 事 (acto / acontecimiento) → "el acto sagrado de alimentarse"',
      mnemonic: 'Un tejado protege el recipiente con buen grano para nutrir la vida diaria.'
    },
    {
      kanji: '魚',
      kana: 'さかな',
      meaning: 'Pez / Pescado',
      onyomi: 'GYO [ぎょ]',
      kunyomi: 'sakana, uo [さかな, うお]',
      type: 'Kanji',
      breakdown: [
        { char: '魚', reading: 'さかな', meaning: 'pez' }
      ],
      breakdown_text: 'Ideograma pictográfico: cabeza puntiaguda (勹), cuerpo con escamas (田) y cuatro gotas simulando la aleta caudal (灬)',
      mnemonic: 'Un pez nadando ágilmente en aguas limpias con sus aletas relucientes.'
    }
  ],
  '4_2': [
    {
      kanji: 'お茶',
      kana: 'おちゃ',
      meaning: 'Té verde / Infusión de té',
      onyomi: 'CHA, SA [ちゃ, さ]',
      kunyomi: 'ocha [おちゃ]',
      type: 'Jukugo',
      breakdown: [
        { char: 'お', reading: 'お', meaning: 'prefijo de respeto' },
        { char: '茶', reading: 'ちゃ', meaning: 'hoja de té' }
      ],
      breakdown_text: 'Hierba (艹) sobre un tejado de madera que alberga las hojas secándose al viento',
      mnemonic: 'Hojas recolectadas con calma para preparar la bebida de bienvenida tradicional.'
    },
    {
      kanji: '好き',
      kana: 'すき',
      meaning: 'Gustar / Agradar / Afición',
      onyomi: 'KOU [こう]',
      kunyomi: 'su(ki), kono(mu) [す(き), この(む)]',
      type: 'Kanji',
      breakdown: [
        { char: '女', reading: 'おんな', meaning: 'mujer / madre' },
        { char: '子', reading: 'こ', meaning: 'hijo / niño' }
      ],
      breakdown_text: '女 (madre) + 子 (hijo): el amor entrañable e incondicional entre una madre y su hijo',
      mnemonic: 'El afecto más puro de todos: la madre que abraza complacida a su pequeño hijo.'
    }
  ],

  // === MÓDULO 5 ===
  '5_1': [
    {
      kanji: '牛肉',
      kana: 'ぎゅうにく',
      meaning: 'Carne de vacuno',
      onyomi: 'GYUU, NIKU [ぎゅう, にく]',
      kunyomi: 'ushi [うし]',
      type: 'Jukugo',
      breakdown: [
        { char: '牛', reading: 'ぎゅう', meaning: 'vaca / buey' },
        { char: '肉', reading: 'にく', meaning: 'carne' }
      ],
      breakdown_text: '牛 (buey con cuernos) + 肉 (filete de carne veteada) → "carne proveniente del ganado vacuno"',
      mnemonic: 'El buey con sus cuernos arriba y la carne tierna con vetas nutricionales.'
    },
    {
      kanji: '豚肉',
      kana: 'ぶたにく',
      meaning: 'Carne de cerdo',
      onyomi: 'TON, NIKU [とん, にく]',
      kunyomi: 'buta [ぶた]',
      type: 'Jukugo',
      breakdown: [
        { char: '豚', reading: 'ぶた', meaning: 'cerdo' },
        { char: '肉', reading: 'にく', meaning: 'carne' }
      ],
      breakdown_text: 'Radical 月 (carne) + 豕 (animal porcino con cola rizada) → "carne de cerdo"',
      mnemonic: 'Un animal robusto del campo cuya carne alimenta los sabrosos platillos de Japón.'
    }
  ],
  '5_2': [
    {
      kanji: '店員',
      kana: 'てんいん',
      meaning: 'Camarero / Empleado de tienda / Dependiente',
      onyomi: 'TEN, IN [てん, いん]',
      kunyomi: 'mise [みせ]',
      type: 'Jukugo',
      breakdown: [
        { char: '店', reading: 'てん', meaning: 'tienda / local comercial' },
        { char: '員', reading: 'いん', meaning: 'miembro / personal' }
      ],
      breakdown_text: '店 (tienda) + 員 (miembro / personal) → "persona adscrita al servicio comercial del establecimiento"',
      mnemonic: 'Bajo el alero del comercio (店), el empleado con su gafete (員) atiende a los comensales.'
    },
    {
      kanji: '一つ',
      kana: 'ひとつ',
      meaning: 'Uno (contador universal nativo japonés)',
      onyomi: 'ICHI [いち]',
      kunyomi: 'hito(tsu) [ひと(つ)]',
      type: 'Jukugo',
      breakdown: [
        { char: '一', reading: 'ひと', meaning: 'uno' },
        { char: 'つ', reading: 'つ', meaning: 'sufijo contador nativo' }
      ],
      breakdown_text: 'El ideograma 一 marca una unidad elemental seguida del sufijo numeral autóctono つ',
      mnemonic: 'Una sola línea firme en el horizonte que representa el comienzo de todo recuento.'
    }
  ],

  // === MÓDULO 6 ===
  '6_1': [
    {
      kanji: '新築',
      kana: 'しんちく',
      meaning: 'Nueva construcción / Casa a estrenar',
      onyomi: 'SHIN, CHIKU [しん, ちく]',
      kunyomi: 'atara(shii), kizu(ku) [あたら(しい), きず(く)]',
      type: 'Jukugo',
      breakdown: [
        { char: '新', reading: 'しん', meaning: 'nuevo' },
        { char: '築', reading: 'ちく', meaning: 'construir / edificar' }
      ],
      breakdown_text: '新 (nuevo y reluciente) + 築 (edificación con madera y bambú) → "vivienda recién construida"',
      mnemonic: 'Un hacha que corta madera fresca (新) para levantar una vivienda flamante.'
    },
    {
      kanji: '広大',
      kana: 'こうだい',
      meaning: 'Vasto / Muy espacioso / Amplio',
      onyomi: 'KOU, DAI [こう, だい]',
      kunyomi: 'hiro(i), oo(kii) [ひろ(い), おお(きい)]',
      type: 'Jukugo',
      breakdown: [
        { char: '広', reading: 'こう', meaning: 'amplio / espacioso' },
        { char: '大', reading: 'だい', meaning: 'grande' }
      ],
      breakdown_text: '広 (alero que cobija un gran espacio interior) + 大 (persona con brazos abiertos)',
      mnemonic: 'Bajo este amplio techo se abren los brazos sin tocar ninguna pared.'
    }
  ],

  // === MÓDULO 7 ===
  '7_1': [
    {
      kanji: '学校',
      kana: 'がっこう',
      meaning: 'Escuela / Colegio',
      onyomi: 'GAKU, KOU [がく, こう]',
      kunyomi: 'mana(bu) [まな(ぶ)]',
      type: 'Jukugo',
      breakdown: [
        { char: '学', reading: 'がく', meaning: 'estudio / aprender' },
        { char: '校', reading: 'こう', meaning: 'edificio escolar' }
      ],
      breakdown_text: '学 (aprender) + 校 (edificio de vigas de madera donde se congregan los alumnos)',
      mnemonic: 'Un recinto de madera donde maestros y alumnos examinan y comparan conocimientos.'
    },
    {
      kanji: '駅',
      kana: 'えき',
      meaning: 'Estación de tren / Parada de posta',
      onyomi: 'EKI [えき]',
      kunyomi: 'eki [えき]',
      type: 'Kanji',
      breakdown: [
        { char: '馬', reading: 'うま', meaning: 'caballo / montura' },
        { char: '尺', reading: 'しゃく', meaning: 'medida / posta' }
      ],
      breakdown_text: 'Antigua posta donde los caballos descansaban y se relevaban, origen de las estaciones modernas',
      mnemonic: 'El caballo veloz que se detiene en el andén para permitir el transbordo de viajeros.'
    }
  ],
  '7_2': [
    {
      kanji: '上下',
      kana: 'じょうげ',
      meaning: 'Arriba y abajo / Altibajos / Superior e inferior',
      onyomi: 'JOU, GE [じょう, げ]',
      kunyomi: 'ue, shita [うえ, した]',
      type: 'Jukugo',
      breakdown: [
        { char: '上', reading: 'じょう', meaning: 'arriba / sobre' },
        { char: '下', reading: 'げ', meaning: 'abajo / debajo' }
      ],
      breakdown_text: '上 (trazo vertical sobre la línea base) + 下 (trazo suspendido bajo la línea base)',
      mnemonic: 'Una línea marca la superficie: el punto superior mira al cielo y el inferior a la tierra.'
    },
    {
      kanji: '室内',
      kana: 'しつない',
      meaning: 'Interior de la habitación / Puertas adentro',
      onyomi: 'SHITSU, NAI [しつ, ない]',
      kunyomi: 'muro, uchi [むろ, うち]',
      type: 'Jukugo',
      breakdown: [
        { char: '室', reading: 'しつ', meaning: 'habitación / cuarto' },
        { char: '内', reading: 'ない', meaning: 'dentro / interior' }
      ],
      breakdown_text: '室 (cuarto techado) + 内 (entrar en un espacio cerrado) → "espacio interno del cuarto"',
      mnemonic: 'Cruzamos la puerta para refugiarnos en la calidez del interior de la habitación.'
    }
  ],

  // === MÓDULO 8 ===
  '8_1': [
    {
      kanji: '月曜日',
      kana: 'げつようび',
      meaning: 'Lunes (Día de la Luna)',
      onyomi: 'GETSU, YOU, BI [げつ, よう, び]',
      kunyomi: 'tsuki, hi [つき, ひ]',
      type: 'Jukugo',
      breakdown: [
        { char: '月', reading: 'げつ', meaning: 'luna' },
        { char: '曜', reading: 'よう', meaning: 'cuerpo celeste / día semana' },
        { char: '日', reading: 'び', meaning: 'sol / día' }
      ],
      breakdown_text: '月 (luna) + 曜日 (día celeste) → "día regido por el resplandor de la luna"',
      mnemonic: 'La media luna brilla en el cielo iluminando el primer día laboral de la semana.'
    },
    {
      kanji: '火曜日',
      kana: 'かようび',
      meaning: 'Martes (Día del Fuego / Marte)',
      onyomi: 'KA, YOU, BI [か, よう, び]',
      kunyomi: 'hi [ひ]',
      type: 'Jukugo',
      breakdown: [
        { char: '火', reading: 'か', meaning: 'fuego' },
        { char: '曜', reading: 'よう', meaning: 'cuerpo celeste' },
        { char: '日', reading: 'び', meaning: 'día' }
      ],
      breakdown_text: '火 (fuego / planeta Marte) + 曜日 (día celeste) → "día regido por el calor del fuego"',
      mnemonic: 'Llamas ardientes que dan energía para afrontar las tareas del martes.'
    }
  ],
  '8_2': [
    {
      kanji: '水曜日',
      kana: 'すいようび',
      meaning: 'Miércoles (Día del Agua / Mercurio)',
      onyomi: 'SUI, YOU, BI [すい, よう, び]',
      kunyomi: 'mizu [みず]',
      type: 'Jukugo',
      breakdown: [
        { char: '水', reading: 'すい', meaning: 'agua' },
        { char: '曜', reading: 'よう', meaning: 'cuerpo celeste' },
        { char: '日', reading: 'び', meaning: 'día' }
      ],
      breakdown_text: '水 (agua) + 曜日 (día celeste) → "día del elemento fluido y sereno"',
      mnemonic: 'Corriente de agua pura que fluye a mitad de semana refrescando el esfuerzo.'
    },
    {
      kanji: '金曜日',
      kana: 'きんようび',
      meaning: 'Viernes (Día del Metal / Oro / Venus)',
      onyomi: 'KIN, YOU, BI [きん, よう, び]',
      kunyomi: 'kane [かね]',
      type: 'Jukugo',
      breakdown: [
        { char: '金', reading: 'きん', meaning: 'oro / metal' },
        { char: '曜', reading: 'よう', meaning: 'cuerpo celeste' },
        { char: '日', reading: 'び', meaning: 'día' }
      ],
      breakdown_text: '金 (oro / brillo) + 曜日 (día celeste) → "día de recompensa áurea al terminar la labor"',
      mnemonic: 'Pepitas de oro guardadas bajo la tierra esperando ser celebradas el fin de semana.'
    }
  ],

  // === MÓDULO 9 ===
  '9_1': [
    {
      kanji: '朝昼',
      kana: 'あさひる',
      meaning: 'Mañana y mediodía',
      onyomi: 'CHOU, CHUU [ちょう, ちゅう]',
      kunyomi: 'asa, hiru [あさ, ひる]',
      type: 'Jukugo',
      breakdown: [
        { char: '朝', reading: 'あさ', meaning: 'mañana / amanecer' },
        { char: '昼', reading: 'ひる', meaning: 'mediodía / día' }
      ],
      breakdown_text: '朝 (sol saliendo entre la niebla matinal) + 昼 (el sol en el cenit)',
      mnemonic: 'Desde que amanece hasta que el sol brilla vertical en lo alto de la jornada laboral.'
    },
    {
      kanji: '夜間',
      kana: 'やかん',
      meaning: 'Turno de noche / Horario nocturno',
      onyomi: 'YA, KAN [や, かん]',
      kunyomi: 'yoru, aida [よる, あいだ]',
      type: 'Jukugo',
      breakdown: [
        { char: '夜', reading: 'や', meaning: 'noche' },
        { char: '間', reading: 'かん', meaning: 'intervalo / espacio' }
      ],
      breakdown_text: '夜 (noche estrellada) + 間 (intervalo de tiempo) → "periodo nocturno de guardia"',
      mnemonic: 'Bajo el manto oscuro de la noche, se cumplen las normas con seriedad.'
    }
  ],

  // === MÓDULO 10 ===
  '10_1': [
    {
      kanji: '読書',
      kana: 'どくしょ',
      meaning: 'Lectura de libros / Hábito lector',
      onyomi: 'DOKU, SHO [どく, しょ]',
      kunyomi: 'yo(mu), ka(ku) [よ(む), か(く)]',
      type: 'Jukugo',
      breakdown: [
        { char: '読', reading: 'どく', meaning: 'leer' },
        { char: '書', reading: 'しょ', meaning: 'libro / escribir' }
      ],
      breakdown_text: '言 (palabras) + 売 (divulgar) y 聿 (pincel que traza caracteres) → "leer textos escritos"',
      mnemonic: 'El pincel plasma las ideas y la mirada atenta lee las palabras en el libro.'
    },
    {
      kanji: '新聞',
      kana: 'しんぶん',
      meaning: 'Periódico / Diario de noticias',
      onyomi: 'SHIN, BUN [しん, ぶん]',
      kunyomi: 'atara(shii), ki(ku) [あたら(しい), き(く)]',
      type: 'Jukugo',
      breakdown: [
        { char: '新', reading: 'しん', meaning: 'nuevo' },
        { char: '聞', reading: 'ぶん', meaning: 'oír / enterarse' }
      ],
      breakdown_text: '新 (novedoso) + 聞 (escuchado / oído) → "noticias recién acontecidas"',
      mnemonic: 'Entre dos puertas (門), la oreja (耳) escucha atentamente las novedades del día.'
    }
  ],
  '10_2': [
    {
      kanji: '見学',
      kana: 'けんがく',
      meaning: 'Visita de estudio / Observación formativa',
      onyomi: 'KEN, GAKU [けん, がく]',
      kunyomi: 'mi(ru), mana(bu) [み(る), まな(ぶ)]',
      type: 'Jukugo',
      breakdown: [
        { char: '見', reading: 'けん', meaning: 'ver / observar' },
        { char: '学', reading: 'がく', meaning: 'aprender' }
      ],
      breakdown_text: '見 (ojo con piernas que va y mira) + 学 (aprender) → "aprender presenciando directamente"',
      mnemonic: 'Caminar con ojos abiertos para descubrir y aprender de primera mano.'
    },
    {
      kanji: '親友',
      kana: 'しんゆう',
      meaning: 'Amigo íntimo / Mejor amigo',
      onyomi: 'SHIN, YUU [しん, ゆう]',
      kunyomi: 'oya, tomo [おや, とも]',
      type: 'Jukugo',
      breakdown: [
        { char: '親', reading: 'しん', meaning: 'cercano / afecto' },
        { char: '友', reading: 'ゆう', meaning: 'amigo' }
      ],
      breakdown_text: '親 (familiaridad cercana) + 友 (dos manos entrelazadas en mutuo auxilio) → "amigo entrañable"',
      mnemonic: 'Dos manos derechas que se estrechan lealmente en señal de amistad inquebrantable.'
    }
  ],

  // === MÓDULO 11 ===
  '11_1': [
    {
      kanji: '今日',
      kana: 'きょう',
      meaning: 'Hoy / El día presente',
      onyomi: 'KON, NICHI [こん, にち]',
      kunyomi: 'ima, hi [いま, ひ]',
      type: 'Jukugo',
      breakdown: [
        { char: '今', reading: 'こん', meaning: 'ahora / presente' },
        { char: '日', reading: 'にち', meaning: 'día / sol' }
      ],
      breakdown_text: '今 (el momento actual) + 日 (el sol de esta jornada) → "este día presente"',
      mnemonic: 'El sol de hoy brilla justo en este instante: aprovecha la jornada para aprender.'
    },
    {
      kanji: '今週',
      kana: 'こんしゅう',
      meaning: 'Esta semana',
      onyomi: 'KON, SHUU [こん, しゅう]',
      kunyomi: 'ima [いま]',
      type: 'Jukugo',
      breakdown: [
        { char: '今', reading: 'こん', meaning: 'presente' },
        { char: '週', reading: 'しゅう', meaning: 'ciclo / semana' }
      ],
      breakdown_text: '今 (actual) + 週 (camino que da la vuelta completa en siete días)',
      mnemonic: 'Un ciclo completo de siete jornadas que se recorre en este tiempo presente.'
    }
  ],

  // === MÓDULO 12 ===
  '12_1': [
    {
      kanji: '行来',
      kana: 'ゆきき',
      meaning: 'Idas y venidas / Tránsito continuo',
      onyomi: 'KOU, RAI [こう, らい]',
      kunyomi: 'i(ku), ku(ru) [い(く), く(る)]',
      type: 'Jukugo',
      breakdown: [
        { char: '行', reading: 'ゆき', meaning: 'ir' },
        { char: '来', reading: 'き', meaning: 'venir' }
      ],
      breakdown_text: '行 (cruce de caminos por donde se avanza) + 来 (espiga que llega con la cosecha)',
      mnemonic: 'Paso firme hacia el destino y retorno seguro al hogar en el transporte diario.'
    }
  ],
  '12_2': [
    {
      kanji: '電車',
      kana: 'でんしゃ',
      meaning: 'Tren eléctrico',
      onyomi: 'DEN, SHA [でん, しゃ]',
      kunyomi: 'kuruma [くるま]',
      type: 'Jukugo',
      breakdown: [
        { char: '電', reading: 'でん', meaning: 'electricidad' },
        { char: '車', reading: 'しゃ', meaning: 'vehículo / rueda' }
      ],
      breakdown_text: '電 (energía eléctrica) + 車 (vagón sobre rieles) → "vehículo férreo propulsado por electricidad"',
      mnemonic: 'Un vagón rodante alimentado por la fuerza relampagueante del tendido eléctrico.'
    }
  ],
  '12_3': [
    {
      kanji: '東西南北',
      kana: 'とうざいなんぼく',
      meaning: 'Los cuatro puntos cardinales (Este, Oeste, Sur, Norte)',
      onyomi: 'TOU, ZAI, NAN, BOKU [とう, ざい, なん, ぼく]',
      kunyomi: 'higashi, nishi, minami, kita [ひがし, にし, みなみ, きた]',
      type: 'Jukugo',
      breakdown: [
        { char: '東', reading: 'とう', meaning: 'este (sol tras los árboles)' },
        { char: '西', reading: 'ざい', meaning: 'oeste (aves en el nido al atardecer)' },
        { char: '南', reading: 'なん', meaning: 'sur (vegetación abundante)' },
        { char: '北', reading: 'ぼく', meaning: 'norte (dos personas dándose la espalda al frío)' }
      ],
      breakdown_text: 'Combinación representativa de las cuatro direcciones cardinales en la orientación geográfica',
      mnemonic: 'Desde el sol naciente en el Este hasta la brisa fría del Norte, toda la geografía conectada.'
    }
  ],

  // === MÓDULO 13 ===
  '13_1': [
    {
      kanji: '大小',
      kana: 'だいしょう',
      meaning: 'Grande y pequeño / Magnitud / Dimensiones',
      onyomi: 'DAI, SHOU [だい, しょう]',
      kunyomi: 'oo(kii), chii(sai) [おお(きい), ちい(さい)]',
      type: 'Jukugo',
      breakdown: [
        { char: '大', reading: 'だい', meaning: 'grande' },
        { char: '小', reading: 'しょう', meaning: 'pequeño' }
      ],
      breakdown_text: '大 (persona de pie con brazos extendidos) + 小 (tres granos pequeños dispersos)',
      mnemonic: 'El contraste visual fundamental entre la gran inmensidad y el diminuto detalle.'
    },
    {
      kanji: '高低',
      kana: 'こうてい',
      meaning: 'Alto y bajo / Relieve / Altitud',
      onyomi: 'KOU, TEI [こう, てい]',
      kunyomi: 'taka(i), hiku(i) [たか(い), ひく(い)]',
      type: 'Jukugo',
      breakdown: [
        { char: '高', reading: 'こう', meaning: 'alto' },
        { char: '低', reading: 'てい', meaning: 'bajo' }
      ],
      breakdown_text: '高 (torre de vigilancia elevada) + 低 (persona inclinada hacia el suelo)',
      mnemonic: 'La torre que roza las nubes y el valle que descansa en la llanura inferior.'
    }
  ],

  // === MÓDULO 14 ===
  '14_1': [
    {
      kanji: '出入口',
      kana: 'でいりぐち',
      meaning: 'Puerta de acceso y salida / Acceso principal',
      onyomi: 'SHUTSU, NYUU, KOU [しゅつ, にゅう, こう]',
      kunyomi: 'de, iri, kuchi [で, いり, くち]',
      type: 'Jukugo',
      breakdown: [
        { char: '出', reading: 'で', meaning: 'salir' },
        { char: '入', reading: 'いり', meaning: 'entrar' },
        { char: '口', reading: 'ぐち', meaning: 'apertura / boca' }
      ],
      breakdown_text: '出 (brotar hacia fuera) + 入 (adentrarse bajo el dintel) + 口 (abertura de tránsito)',
      mnemonic: 'La apertura arquitectónica por donde transcurre el flujo de personas en el gran almacén.'
    }
  ],

  // === MÓDULO 15 ===
  '15_1': [
    {
      kanji: '千万',
      kana: 'せんまん',
      meaning: 'Diez millones / Cifra cuantiosa / Innumerables',
      onyomi: 'SEN, MAN [せん, まん]',
      kunyomi: 'chi, yorozu [ち, よろず]',
      type: 'Jukugo',
      breakdown: [
        { char: '千', reading: 'せん', meaning: 'mil' },
        { char: '万', reading: 'まん', meaning: 'diez mil' }
      ],
      breakdown_text: '千 (un diez multiplicado por cien) + 万 (un enjambre que denota gran multitud)',
      mnemonic: 'Multiplicación matemática que abre paso al sistema contable monetario en yenes.'
    },
    {
      kanji: '円高',
      kana: 'えんだか',
      meaning: 'Yen fuerte / Apreciación del yen',
      onyomi: 'EN, KOU [えん, こう]',
      kunyomi: 'maru(i), taka(i) [まる(い), たか(い)]',
      type: 'Jukugo',
      breakdown: [
        { char: '円', reading: 'えん', meaning: 'círculo / yen' },
        { char: '高', reading: 'だか', meaning: 'elevado / alto' }
      ],
      breakdown_text: '円 (moneda redonda) + 高 (valor alto en cotización)',
      mnemonic: 'La moneda circular japonesa alcanzando un valor destacado en las transacciones.'
    }
  ],

  // === MÓDULO 16 ===
  '16_1': [
    {
      kanji: '天気',
      kana: 'てんき',
      meaning: 'Tiempo atmosférico / Clima del día',
      onyomi: 'TEN, KI [てん, き]',
      kunyomi: 'ame, sora [あめ, そら]',
      type: 'Jukugo',
      breakdown: [
        { char: '天', reading: 'てん', meaning: 'cielo / bóveda celeste' },
        { char: '気', reading: 'き', meaning: 'aire / energía / vapor' }
      ],
      breakdown_text: '天 (cielo sobre la persona) + 気 (vapores y energía cósmica) → "estado atmosférico"',
      mnemonic: 'El vapor asciende al cielo determinando si la jornada será soleada o lluviosa.'
    }
  ],
  '16_2': [
    {
      kanji: '外国',
      kana: 'がいこく',
      meaning: 'País extranjero / El exterior',
      onyomi: 'GAI, KOKU [がい, こく]',
      kunyomi: 'soto, kuni [そと, くに]',
      type: 'Jukugo',
      breakdown: [
        { char: '外', reading: 'がい', meaning: 'fuera / exterior' },
        { char: '国', reading: 'こく', meaning: 'país / frontera' }
      ],
      breakdown_text: '外 (más allá del límite) + 国 (territorio soberano rodeado por sus murallas) → "nación foránea"',
      mnemonic: 'Más allá de las fronteras conocidas se extienden las tierras lejanas de ultramar.'
    }
  ],
  '16_3': [
    {
      kanji: '映画',
      kana: 'えいが',
      meaning: 'Película / Largometraje cinematográfico',
      onyomi: 'EI, GA [えい, が]',
      kunyomi: 'utsu(ru), e [うつ(る), え]',
      type: 'Jukugo',
      breakdown: [
        { char: '映', reading: 'えい', meaning: 'reflejar / proyectar' },
        { char: '画', reading: 'が', meaning: 'cuadro / pintura / lienzo' }
      ],
      breakdown_text: '日 (luz) sobre 中央 (centro) proyectando sobre 画 (un lienzo delimitado) → "proyección en pantalla"',
      mnemonic: 'Un haz de luz proyecta imágenes animadas sobre la gran pantalla del cine.'
    }
  ],

  // === MÓDULO 17 ===
  '17_1': [
    {
      kanji: '旅行',
      kana: 'りょこう',
      meaning: 'Viaje / Travesía turística',
      onyomi: 'RYO, KOU [りょ, こう]',
      kunyomi: 'tabi, i(ku) [たび, い(く)]',
      type: 'Jukugo',
      breakdown: [
        { char: '旅', reading: 'りょ', meaning: 'viaje / estandarte' },
        { char: '行', reading: 'こう', meaning: 'avanzar / marchar' }
      ],
      breakdown_text: '方 (estandarte ondeando) junto a personas en marcha + 行 (camino) → "partir de expedición"',
      mnemonic: 'Un grupo de personas sigue la bandera del guía descubriendo nuevos paisajes.'
    }
  ],
  '17_2': [
    {
      kanji: '温泉',
      kana: 'おんせん',
      meaning: 'Aguas termales / Baño onsen natural',
      onyomi: 'ON, SEN [おん, せん]',
      kunyomi: 'atata(kai), izumi [あたた(かい), いずみ]',
      type: 'Jukugo',
      breakdown: [
        { char: '温', reading: 'おん', meaning: 'tibio / caliente' },
        { char: '泉', reading: 'せん', meaning: 'manantial / fuente natural' }
      ],
      breakdown_text: '水 (agua) calentada en plato (皿) + 白 (agua pura y clara) brotando de la fuente (泉)',
      mnemonic: 'Un manantial volcánico de agua mineral caliente que relaja el cuerpo en plena naturaleza.'
    }
  ],

  // === MÓDULO 18 ===
  '18_1': [
    {
      kanji: '病院',
      kana: 'びょういん',
      meaning: 'Hospital / Clínica médica',
      onyomi: 'BYOU, IN [びょう, いん]',
      kunyomi: 'ya(mu) [や(む)]',
      type: 'Jukugo',
      breakdown: [
        { char: '病', reading: 'びょう', meaning: 'enfermedad / dolencia' },
        { char: '院', reading: 'いん', meaning: 'institución / recinto' }
      ],
      breakdown_text: '疒 (persona postrada en cama) + 院 (edificio amurallado con doctores) → "centro de sanación"',
      mnemonic: 'Un recinto especializado donde los enfermos reciben cuidados y recuperan la salud.'
    },
    {
      kanji: '薬局',
      kana: 'やっきょく',
      meaning: 'Farmacia / Botica',
      onyomi: 'YAKU, KYOKU [やく, きょく]',
      kunyomi: 'kusuri [くすり]',
      type: 'Jukugo',
      breakdown: [
        { char: '薬', reading: 'やく', meaning: 'medicina / hierba medicinal' },
        { char: '局', reading: 'きょく', meaning: 'oficina / departamento' }
      ],
      breakdown_text: '艹 (hierbas) + 楽 (alegría / alivio): plantas que devuelven la sonrisa al mitigar el dolor',
      mnemonic: 'Hierbas medicinales preparadas con maestría para aliviar cualquier síntoma corporal.'
    }
  ],
  '18_2': [
    {
      kanji: '頭痛',
      kana: 'ずつう',
      meaning: 'Dolor de cabeza / Cefalea',
      onyomi: 'TOU, TSUU [とう, つう]',
      kunyomi: 'atama, ita(i) [あたま, いた(い)]',
      type: 'Jukugo',
      breakdown: [
        { char: '頭', reading: 'ず', meaning: 'cabeza' },
        { char: '痛', reading: 'つう', meaning: 'dolor / afección' }
      ],
      breakdown_text: '頭 (cabeza con sienes) + 痛 (malestar que punza bajo el lecho de la enfermedad)',
      mnemonic: 'Sensación punzante en la cabeza que requiere reposo inmediato y una buena medicina.'
    },
    {
      kanji: '体調',
      kana: 'たいちょう',
      meaning: 'Estado físico / Condición de salud',
      onyomi: 'TAI, CHOU [たい, ちょう]',
      kunyomi: 'karada, totono(eru) [からだ, ととの(える)]',
      type: 'Jukugo',
      breakdown: [
        { char: '体', reading: 'たい', meaning: 'cuerpo humano' },
        { char: '調', reading: 'ちょう', meaning: 'tono / equilibrio / armonía' }
      ],
      breakdown_text: '体 (cuerpo) + 調 (armonía / entonación) → "el balance y equilibrio armónico del cuerpo"',
      mnemonic: 'Cuando el cuerpo está en perfecta armonía con la mente, gozamos de vitalidad.'
    }
  ],

  // === MÓDULO 19 ===
  '19_1': [
    {
      kanji: '教師',
      kana: 'きょうし',
      meaning: 'Profesor / Docente',
      onyomi: 'KYOU, SHI [きょう, し]',
      kunyomi: 'oshi(eru) [おし(える)]',
      type: 'Jukugo',
      breakdown: [
        { char: '教', reading: 'きょう', meaning: 'enseñar / doctrina' },
        { char: '師', reading: 'し', meaning: 'maestro / experto' }
      ],
      breakdown_text: '教 (enseñar conocimientos) + 師 (maestro venerado) → "profesional de la enseñanza"',
      mnemonic: 'Un maestro que guía con paciencia y rigor a las nuevas generaciones.'
    },
    {
      kanji: '上手',
      kana: 'じょうず',
      meaning: 'Hábil / Diestro / Destacado en una disciplina',
      onyomi: 'JOU, SHU [じょう, しゅ]',
      kunyomi: 'ue, te [うえ, て]',
      type: 'Jukugo',
      breakdown: [
        { char: '上', reading: 'じょう', meaning: 'arriba / superior' },
        { char: '手', reading: 'ず', meaning: 'mano / destreza' }
      ],
      breakdown_text: '上 (por encima) + 手 (mano) → "tener la mano por encima del promedio; gran habilidad"',
      mnemonic: 'Manos elevadas con destreza que dominan el arte y el idioma con soltura.'
    }
  ],

  // === MÓDULO 20 ===
  '20_1': [
    {
      kanji: '先週',
      kana: 'せんしゅう',
      meaning: 'La semana pasada',
      onyomi: 'SEN, SHUU [せん, しゅう]',
      kunyomi: 'saki [さき]',
      type: 'Jukugo',
      breakdown: [
        { char: '先', reading: 'せん', meaning: 'previo / antes' },
        { char: '週', reading: 'しゅう', meaning: 'semana / ciclo' }
      ],
      breakdown_text: '先 (precedente) + 週 (semana) → "el ciclo semanal inmediatamente anterior"',
      mnemonic: 'Mirar hacia el ciclo anterior de siete días que acaba de concluir.'
    },
    {
      kanji: '到着',
      kana: 'とうちゃく',
      meaning: 'Llegada / Arribo a destino',
      onyomi: 'TOU, CHAKU [とう, ちゃく]',
      kunyomi: 'ita(ru), tsu(ku) [いた(る), つ(く)]',
      type: 'Jukugo',
      breakdown: [
        { char: '到', reading: 'とう', meaning: 'alcanzar / llegar' },
        { char: '着', reading: 'ちゃく', meaning: 'arribar / ponerse ropa' }
      ],
      breakdown_text: '到 (llegar con paso firme al destino) + 着 (tocar tierra firme) → "arribo formal"',
      mnemonic: 'El avión aterriza y los pasajeros tocan tierra en su nuevo hogar en Japón.'
    }
  ],
  '20_2': [
    {
      kanji: '真面目',
      kana: 'まじめ',
      meaning: 'Serio / Diligente / Concienzudo',
      onyomi: 'SHIN, MEN, MOKU [しん, めん, もく]',
      kunyomi: 'makoto, me [まこと, め]',
      type: 'Jukugo',
      breakdown: [
        { char: '真', reading: 'ま', meaning: 'verdad / sinceridad' },
        { char: '面', reading: 'じめ', meaning: 'rostro / faz' },
        { char: '目', reading: '', meaning: 'mirada / ojos' }
      ],
      breakdown_text: 'Rostro sincero y mirada recta que denota una persona de máxima confianza y compromiso',
      mnemonic: 'Mirar a los ojos con sinceridad sin desviar la atención de las responsabilidades.'
    },
    {
      kanji: '性格',
      kana: 'せいかく',
      meaning: 'Personalidad / Carácter individual',
      onyomi: 'SEI, KAKU [せい, かく]',
      kunyomi: 'saga [さが]',
      type: 'Jukugo',
      breakdown: [
        { char: '性', reading: 'せい', meaning: 'naturaleza innata' },
        { char: '格', reading: 'かく', meaning: 'estructura / patrón' }
      ],
      breakdown_text: '性 (el corazón innato que brota al nacer) + 格 (la estructura que lo moldea)',
      mnemonic: 'El patrón único que define cómo siente y actúa cada ser humano en sociedad.'
    }
  ],

  // === MÓDULO 21 ===
  '21_1': [
    {
      kanji: '可能',
      kana: 'かのう',
      meaning: 'Posible / Factible / Potencial',
      onyomi: 'KA, NOU [か, のう]',
      kunyomi: 'yo(i) [よ(い)]',
      type: 'Jukugo',
      breakdown: [
        { char: '可', reading: 'か', meaning: 'aprobado / posible' },
        { char: '能', reading: 'のう', meaning: 'capacidad / facultad' }
      ],
      breakdown_text: '可 (lo permisible) + 能 (la fuerza del oso capaz de cumplir la tarea) → "viabilidad técnica"',
      mnemonic: 'Tener la capacidad interna y la aprobación para lograr una acción.'
    }
  ],
  '21_2': [
    {
      kanji: '注文',
      kana: 'ちゅうもん',
      meaning: 'Pedido / Encargo / Orden en restaurante',
      onyomi: 'CHUU, MON [ちゅう, もん]',
      kunyomi: 'soso(gu), to(u) [そそ(ぐ), と(う)]',
      type: 'Jukugo',
      breakdown: [
        { char: '注', reading: 'ちゅう', meaning: 'verter atención' },
        { char: '文', reading: 'もん', meaning: 'escrito / frase' }
      ],
      breakdown_text: '注 (poner atención) + 文 (petición formulada) → "solicitud formal de platillos"',
      mnemonic: 'El cliente comunica con atención los platillos deseados al mesero.'
    }
  ],

  // === MÓDULO 22 ===
  '22_1': [
    {
      kanji: '予約',
      kana: 'よやく',
      meaning: 'Reserva anticipada / Cita previa',
      onyomi: 'YO, YAKU [よ, やく]',
      kunyomi: 'arakaji(me), musu(bu) [あらかじ(め), むす(ぶ)]',
      type: 'Jukugo',
      breakdown: [
        { char: '予', reading: 'よ', meaning: 'con antelación' },
        { char: '約', reading: 'やく', meaning: 'pacto / compromiso' }
      ],
      breakdown_text: '予 (anticiparse en el tiempo) + 約 (atar una cuerda en compromiso) → "acuerdo previo"',
      mnemonic: 'Atar un lazo de compromiso antes de que comience el viaje para asegurar el asiento.'
    }
  ],
  '22_2': [
    {
      kanji: '経験',
      kana: 'けいけん',
      meaning: 'Experiencia personal vivida',
      onyomi: 'KEI, KEN [けい, けん]',
      kunyomi: 'he(ru), tame(su) [へ(る), ため(す)]',
      type: 'Jukugo',
      breakdown: [
        { char: '経', reading: 'けい', meaning: 'atravesar el tiempo' },
        { char: '験', reading: 'けん', meaning: 'poner a prueba' }
      ],
      breakdown_text: '経 (recorrer los caminos) + 験 (comprobar la realidad en persona)',
      mnemonic: 'Recorrer el sendero en primera persona para verificar el aprendizaje con vivencias.'
    }
  ],

  // === MÓDULO 23 ===
  '23_1': [
    {
      kanji: '花火',
      kana: 'はなび',
      meaning: 'Fuegos artificiales',
      onyomi: 'KA, KA [か, か]',
      kunyomi: 'hana, bi [はな, び]',
      type: 'Jukugo',
      breakdown: [
        { char: '花', reading: 'はな', meaning: 'flor' },
        { char: '火', reading: 'び', meaning: 'fuego' }
      ],
      breakdown_text: '花 (flor) + 火 (fuego) → "flores de fuego que florecen en el firmamento nocturno"',
      mnemonic: 'Pólvora que se abre en el cielo nocturno del verano japonés como un ramillete de flores.'
    }
  ],
  '23_2': [
    {
      kanji: '参加',
      kana: 'さんか',
      meaning: 'Participación / Sumarse a un evento',
      onyomi: 'SAN, KA [さん, か]',
      kunyomi: 'mai(ru), kuwa(waru) [まい(る), くわ(わる)]',
      type: 'Jukugo',
      breakdown: [
        { char: '参', reading: 'さん', meaning: 'acudir / congregarse' },
        { char: '加', reading: 'か', meaning: 'añadir fuerza' }
      ],
      breakdown_text: '参 (presentarse en el lugar) + 加 (sumar la fuerza de uno al colectivo)',
      mnemonic: 'Sumar la presencia y energía propia al grupo para celebrar en comunidad.'
    }
  ],

  // === MÓDULO 24 ===
  '24_1': [
    {
      kanji: '着物',
      kana: 'きもの',
      meaning: 'Kimono / Prenda tradicional japonesa',
      onyomi: 'CHAKU, BUTSU [ちゃく, ぶつ]',
      kunyomi: 'ki(ru), mono [き(る), もの]',
      type: 'Jukugo',
      breakdown: [
        { char: '着', reading: 'き', meaning: 'vestir / llevar puesto' },
        { char: '物', reading: 'もの', meaning: 'objeto / cosa' }
      ],
      breakdown_text: '着 (llevar ceñido al cuerpo) + 物 (objeto tangible) → "aquello que se viste"',
      mnemonic: 'La vestimenta de seda ceñida al cuerpo con solemnidad en las ocasiones señaladas.'
    }
  ],
  '24_2': [
    {
      kanji: '正月',
      kana: 'しょうがつ',
      meaning: 'Año Nuevo / Mes principal del calendario',
      onyomi: 'SHOU, GATSU [しょう, がつ]',
      kunyomi: 'tada(shii), tsuki [ただ(しい), つき]',
      type: 'Jukugo',
      breakdown: [
        { char: '正', reading: 'しょう', meaning: 'recto / principal / primero' },
        { char: '月', reading: 'がつ', meaning: 'mes / luna' }
      ],
      breakdown_text: '正 (iniciar con rectitud) + 月 (el primer mes) → "el mes donde se renueva la vida con rectitud"',
      mnemonic: 'Dar el primer paso del año con pureza y devoción en los santuarios tradicionales.'
    }
  ],

  // === MÓDULO 25 ===
  '25_1': [
    {
      kanji: '性能',
      kana: 'せいのう',
      meaning: 'Rendimiento / Prestaciones técnicas',
      onyomi: 'SEI, NOU [せい, のう]',
      kunyomi: 'saga, ata(u) [さが, あた(う)]',
      type: 'Jukugo',
      breakdown: [
        { char: '性', reading: 'せい', meaning: 'cualidad natural' },
        { char: '能', reading: 'のう', meaning: 'capacidad operativa' }
      ],
      breakdown_text: '性 (característica) + 能 (potencia práctica) → "capacidad funcional de un aparato"',
      mnemonic: 'La potencia y eficiencia con la que un electrodoméstico facilita la vida diaria.'
    }
  ],
  '25_2': [
    {
      kanji: '割引',
      kana: 'わりびき',
      meaning: 'Descuento / Rebaja en el precio',
      onyomi: 'KATSU, IN [かつ, いん]',
      kunyomi: 'wari, biki [わり, びき]',
      type: 'Jukugo',
      breakdown: [
        { char: '割', reading: 'わり', meaning: 'dividir / porcentaje' },
        { char: '引', reading: 'びき', meaning: 'tirar hacia abajo / restar' }
      ],
      breakdown_text: '割 (fracción porcentual) + 引 (sustraer del total) → "rebaja sobre el costo original"',
      mnemonic: 'Tirar hacia abajo del precio para premiar la fidelidad del cliente con puntos y rebajas.'
    }
  ],

  // === MÓDULO 26 ===
  '26_1': [
    {
      kanji: '規則',
      kana: 'きそく',
      meaning: 'Norma / Reglamento / Directriz',
      onyomi: 'KI, SOKU [き, そく]',
      kunyomi: 'tada(su), notto(ru) [ただ(す), のっと(る)]',
      type: 'Jukugo',
      breakdown: [
        { char: '規', reading: 'き', meaning: 'compás / medir con rectitud' },
        { char: '則', reading: 'そく', meaning: 'ley / principio' }
      ],
      breakdown_text: '夫 (persona adulta) con 見 (mirada recta) junto a 貝 (dinero/ley) y 刂 (cuchillo que graba la ley)',
      mnemonic: 'Leyes grabadas con precisión para garantizar la convivencia ordenada en sociedad.'
    }
  ],
  '26_2': [
    {
      kanji: '美容院',
      kana: 'びよういん',
      meaning: 'Peluquería / Salón de belleza',
      onyomi: 'BI, YOU, IN [び, よう, いん]',
      kunyomi: 'utsuku(shii), katachi [うつく(しい), かたち]',
      type: 'Jukugo',
      breakdown: [
        { char: '美', reading: 'び', meaning: 'belleza / armonía' },
        { char: '容', reading: 'よう', meaning: 'rostro / apariencia' },
        { char: '院', reading: 'いん', meaning: 'establecimiento' }
      ],
      breakdown_text: '美 (hermosura) + 容 (porte y rostro) + 院 (recinto profesional) → "salón de cuidado estético"',
      mnemonic: 'Un espacio refinado donde manos expertas cuidan el cabello y la presentación personal.'
    }
  ],

  // === MÓDULO 27 ===
  '27_1': [
    {
      kanji: '資源',
      kana: 'しげん',
      meaning: 'Recursos naturales / Materiales reciclables',
      onyomi: 'SHI, GEN [し, げん]',
      kunyomi: 'tada(shi), minamoto [ただ(し), みなもと]',
      type: 'Jukugo',
      breakdown: [
        { char: '資', reading: 'し', meaning: 'bienes / riqueza' },
        { char: '源', reading: 'げん', meaning: 'fuente / manantial' }
      ],
      breakdown_text: '次 (ayuda económica con conchas 貝) + 原 (manantial cristalino) → "fuente nutricia de la tierra"',
      mnemonic: 'Cuidar el manantial de la tierra para que las futuras generaciones disfruten de sus frutos.'
    }
  ],
  '27_2': [
    {
      kanji: '地震',
      kana: 'じしん',
      meaning: 'Terremoto / Sismo',
      onyomi: 'JI, SHIN [じ, しん]',
      kunyomi: 'chi, furu(eru) [ち, ふる(える)]',
      type: 'Jukugo',
      breakdown: [
        { char: '地', reading: 'じ', meaning: 'tierra / suelo' },
        { char: '震', reading: 'しん', meaning: 'temblor / sacudida sísmica' }
      ],
      breakdown_text: '地 (el suelo firme) + 雨 (fuerza de los cielos) sobre 辰 (dragón subterráneo que despierta)',
      mnemonic: 'La tierra tiembla bajo nuestros pies: proteger la cabeza y esperar que pase la sacudida.'
    }
  ],

  // === MÓDULO 28 ===
  '28_1': [
    {
      kanji: '目標',
      kana: 'もくひょう',
      meaning: 'Objetivo / Meta hacia la que se avanza',
      onyomi: 'MOKU, HYOU [もく, ひょう]',
      kunyomi: 'me, shirushi [め, しるし]',
      type: 'Jukugo',
      breakdown: [
        { char: '目', reading: 'もく', meaning: 'ojo / mirada' },
        { char: '標', reading: 'ひょう', meaning: 'poste indicador / hito' }
      ],
      breakdown_text: '目 (fijar la mirada) + 標 (hito de madera que marca la meta en el camino)',
      mnemonic: 'Poner los ojos en el poste indicador y no desviarse hasta alcanzar el destino trazado.'
    }
  ],
  '28_2': [
    {
      kanji: '感謝',
      kana: 'かんしゃ',
      meaning: 'Gratitud sincera / Agradecimiento',
      onyomi: 'KAN, SHA [かん, しゃ]',
      kunyomi: 'kan(jiru), ayama(ru) [かん(じる), あやま(る)]',
      type: 'Jukugo',
      breakdown: [
        { char: '感', reading: 'かん', meaning: 'sentir en el corazón' },
        { char: '謝', reading: 'しゃ', meaning: 'expresar con palabras respetuosas' }
      ],
      breakdown_text: '感 (emoción nacida del corazón 心) + 言 (palabras) con 射 (disparadas con sinceridad) → "dar las gracias"',
      mnemonic: 'Cuando el corazón rebosa gratitud, las palabras sinceras honran a quienes nos apoyaron.'
    }
  ],

  // === MÓDULO 29 ===
  '29_1': [
    {
      kanji: '評判',
      kana: 'ひょうばん',
      meaning: 'Reputación / Opinión pública / Reseña',
      onyomi: 'HYOU, BAN [ひょう, ばん]',
      kunyomi: 'waza [わざ]',
      type: 'Jukugo',
      breakdown: [
        { char: '評', reading: 'ひょう', meaning: 'criticar / valorar con palabras' },
        { char: '判', reading: 'ばん', meaning: 'juicio / criterio' }
      ],
      breakdown_text: '言 (palabras) sopesadas con 平 (equilibrio) + 半 (dividir con un cuchillo 刂)',
      mnemonic: 'El veredicto sincero del público que define el éxito de una obra o espectáculo.'
    }
  ],
  '29_2': [
    {
      kanji: '感動',
      kana: 'かんどう',
      meaning: 'Emoción profunda / Conmoción artística',
      onyomi: 'KAN, DOU [かん, どう]',
      kunyomi: 'ugo(ku) [うご(く)]',
      type: 'Jukugo',
      breakdown: [
        { char: '感', reading: 'かん', meaning: 'sentimiento' },
        { char: '動', reading: 'どう', meaning: 'movimiento interior' }
      ],
      breakdown_text: '感 (sensibilidad del corazón) + 動 (movimiento motivado por la fuerza 力) → "el corazón que se conmueve"',
      mnemonic: 'Una historia conmovedora que hace latir y vibrar el corazón con lágrimas de belleza.'
    }
  ],

  // === MÓDULO 30 ===
  '30_1': [
    {
      kanji: '修理',
      kana: 'しゅうり',
      meaning: 'Reparación / Arreglo técnico',
      onyomi: 'SHUU, RI [しゅう, り]',
      kunyomi: 'osa(meru), kotowari [おさ(める), ことわり]',
      type: 'Jukugo',
      breakdown: [
        { char: '修', reading: 'しゅう', meaning: 'restaurar / pulir' },
        { char: '理', reading: 'り', meaning: 'orden lógico / razón' }
      ],
      breakdown_text: '修 (devolver a su estado funcional) + 理 (seguir las vetas y principios correctos de la materia)',
      mnemonic: 'Manos diestras que desmontan el mecanismo defectuoso y lo devuelven a su perfecto funcionamiento.'
    }
  ],
  '30_2': [
    {
      kanji: '物件',
      kana: 'ぶっけん',
      meaning: 'Inmueble / Propiedad raíz ofrecida',
      onyomi: 'BUTSU, KEN [ぶつ, けん]',
      kunyomi: 'mono, koto [もの, こと]',
      type: 'Jukugo',
      breakdown: [
        { char: '物', reading: 'ぶつ', meaning: 'cosa material' },
        { char: '件', reading: 'けん', meaning: 'asunto / caso registrado' }
      ],
      breakdown_text: '物 (objeto físico) + 人 (persona) junto a 牛 (ganado/patrimonio) → "artículo inmobiliario clasificado"',
      mnemonic: 'La ficha detallada de una vivienda que espera a sus futuros moradores.'
    }
  ],

  // === MÓDULO 31 ===
  '31_1': [
    {
      kanji: '自炊',
      kana: 'じすい',
      meaning: 'Cocinar para uno mismo / Comida casera',
      onyomi: 'JI, SUI [じ, すい]',
      kunyomi: 'mizuka(ra), ka(gu) [みずか(ら), か(ぐ)]',
      type: 'Jukugo',
      breakdown: [
        { char: '自', reading: 'じ', meaning: 'uno mismo' },
        { char: '炊', reading: 'すい', meaning: 'hervir arroz / cocinar' }
      ],
      breakdown_text: '自 (la propia nariz/rostro) + 火 (fuego) con 欠 (soplar para avivar la llama del hogar)',
      mnemonic: 'Encender el fuego en la cocina propia para preparar un plato nutritivo y saludable.'
    }
  ],
  '31_2': [
    {
      kanji: '郷土料理',
      kana: 'きょうどりょうり',
      meaning: 'Cocina regional / Gastronomía autóctona',
      onyomi: 'KYOU, DO, RYOU, RI [きょう, ど, りょう, り]',
      kunyomi: 'sato, tsuchi [さと, つち]',
      type: 'Jukugo',
      breakdown: [
        { char: '郷', reading: 'きょう', meaning: 'tierra natal / comarca' },
        { char: '土', reading: 'ど', meaning: 'tierra / suelo' },
        { char: '料理', reading: 'りょうり', meaning: 'gastronomía / cocina' }
      ],
      breakdown_text: '郷土 (la tierra natal y sus tradiciones) + 料理 (el arte culinario que la celebra)',
      mnemonic: 'Sabores únicos transmitidos por generaciones utilizando los ingredientes de la comarca.'
    }
  ],

  // === MÓDULO 32 ===
  '32_1': [
    {
      kanji: '交流',
      kana: 'こうりゅう',
      meaning: 'Intercambio cultural / Convivencia social',
      onyomi: 'KOU, RYUU [こう, りゅう]',
      kunyomi: 'maji(waru), naga(reru) [まじ(わる), なが(れる)]',
      type: 'Jukugo',
      breakdown: [
        { char: '交', reading: 'こう', meaning: 'cruzar caminos' },
        { char: '流', reading: 'りゅう', meaning: 'fluir como el agua' }
      ],
      breakdown_text: '交 (dos caminos que se entrecruzan) + 流 (aguas de distintos afluentes que se unen en un río)',
      mnemonic: 'Personas de distintos orígenes que se encuentran y enriquecen mutuamente sus vidas.'
    }
  ],
  '32_2': [
    {
      kanji: '遠慮',
      kana: 'えんりょ',
      meaning: 'Reserva respetuosa / Modestia / Miramiento',
      onyomi: 'EN, RYO [えん, りょ]',
      kunyomi: 'too(i), omo(nbakaru) [とお(い), おも(んばかる)]',
      type: 'Jukugo',
      breakdown: [
        { char: '遠', reading: 'えん', meaning: 'lejos / mirar a distancia' },
        { char: '慮', reading: 'りょ', meaning: 'pensar con cautela' }
      ],
      breakdown_text: '遠 (mirar a largo plazo) + 慮 (corazón 心 que reflexiona bajo el tigre del deber) → "prudencia social"',
      mnemonic: 'Actuar con cortesía prudente para no incomodar ni poner en aprietos al prójimo.'
    }
  ],

  // === MÓDULO 33 ===
  '33_1': [
    {
      kanji: '興味',
      kana: 'きょうみ',
      meaning: 'Interés / Curiosidad intelectual',
      onyomi: 'KYOU, MI [きょう, み]',
      kunyomi: 'oko(su), aji [おこ(す), あじ]',
      type: 'Jukugo',
      breakdown: [
        { char: '興', reading: 'きょう', meaning: 'entusiasmo / despertar' },
        { char: '味', reading: 'み', meaning: 'sabor / deleite' }
      ],
      breakdown_text: '興 (levantar entre cuatro manos con júbilo) + 味 (degustar con deleite)',
      mnemonic: 'El deleite interno que nos impulsa a profundizar con entusiasmo en un nuevo estudio.'
    }
  ],
  '33_2': [
    {
      kanji: '効率',
      kana: 'こうりつ',
      meaning: 'Eficiencia / Rendimiento productivo',
      onyomi: 'KOU, RITSU [こう, りつ]',
      kunyomi: 'ki(ku), hiki(iru) [き(く), ひき(いる)]',
      type: 'Jukugo',
      breakdown: [
        { char: '効', reading: 'こう', meaning: 'efecto positivo' },
        { char: '率', reading: 'りつ', meaning: 'proporción / ratio' }
      ],
      breakdown_text: '力 (fuerza bien aplicada) + 率 (hilo tenso que marca la medida justa) → "óptimo rendimiento"',
      mnemonic: 'Aprovechar cada minuto con método para obtener los mayores frutos en el aprendizaje.'
    }
  ],

  // === MÓDULO 34 ===
  '34_1': [
    {
      kanji: '救急車',
      kana: 'きゅうきゅうしゃ',
      meaning: 'Ambulancia / Vehículo de auxilio urgente',
      onyomi: 'KYUU, KYUU, SHA [きゅう, きゅう, しゃ]',
      kunyomi: 'suku(u), iso(gu), kuruma [すく(う), いそ(ぐ), くるま]',
      type: 'Jukugo',
      breakdown: [
        { char: '救', reading: 'きゅう', meaning: 'socorrer / salvar' },
        { char: '急', reading: 'きゅう', meaning: 'urgencia / prisa' },
        { char: '車', reading: 'しゃ', meaning: 'vehículo' }
      ],
      breakdown_text: '救 (tender la mano al necesitado) + 急 (corazón acelerado ante la emergencia) + 車 (vehículo)',
      mnemonic: 'El vehículo de sirena rápida que corre veloz para salvar vidas humanas.'
    }
  ],
  '34_2': [
    {
      kanji: '詐欺',
      kana: 'さぎ',
      meaning: 'Fraude / Engaño / Estafa',
      onyomi: 'SA, GI [さ, ぎ]',
      kunyomi: 'itsuwa(ru), azamu(ku) [いつわ(る), あざむ(く)]',
      type: 'Jukugo',
      breakdown: [
        { char: '詐', reading: 'さ', meaning: 'palabras falaces' },
        { char: '欺', reading: 'ぎ', meaning: 'burlar la confianza' }
      ],
      breakdown_text: '言 (palabras engañosas) junto a 若 y 其 con 欠 (suspirar por la falta de honradez) → "artimaña tramposa"',
      mnemonic: 'Desconfiar de mensajes sospechosos y cobros no reconocidos para proteger el patrimonio.'
    }
  ],

  // === MÓDULO 35 ===
  '35_1': [
    {
      kanji: '結婚',
      kana: 'けっこん',
      meaning: 'Matrimonio / Boda / Unión conyugal',
      onyomi: 'KEK, KON [けっ, こん]',
      kunyomi: 'musu(bu) [むす(ぶ)]',
      type: 'Jukugo',
      breakdown: [
        { char: '結', reading: 'けっ', meaning: 'atar lazos' },
        { char: '婚', reading: 'こん', meaning: 'boda / unión nupcial' }
      ],
      breakdown_text: '糸 (hilo que anuda destinos) + 女 (la mujer) bajo 日 (la luz del anochecer ceremonial) → "lazo conyugal"',
      mnemonic: 'El hilo rojo del destino que une formalmente a dos almas en un proyecto de vida compartido.'
    }
  ],
  '35_2': [
    {
      kanji: '相談',
      kana: 'そうだん',
      meaning: 'Consulta / Diálogo para pedir consejo',
      onyomi: 'SOU, DAN [そう, だん]',
      kunyomi: 'ai, kata(ru) [あい, かた(る)]',
      type: 'Jukugo',
      breakdown: [
        { char: '相', reading: 'そう', meaning: 'mutuo / contemplarse cara a cara' },
        { char: '談', reading: 'だん', meaning: 'conversar con afecto' }
      ],
      breakdown_text: '相 (árbol 木 observado con el ojo 目 frente a frente) + 言 (palabras) rodeadas por la fogata (炎)',
      mnemonic: 'Sentarse al calor de la confianza para dialogar con franqueza y buscar la mejor solución.'
    }
  ],

  // === MÓDULO 36 ===
  '36_1': [
    {
      kanji: '城下町',
      kana: 'じょうかまち',
      meaning: 'Ciudad feudal al pie de un castillo',
      onyomi: 'JOU, KA, CHOU [じょう, か, ちょう]',
      kunyomi: 'shiro, shita, machi [しろ, した, まち]',
      type: 'Jukugo',
      breakdown: [
        { char: '城', reading: 'じょう', meaning: 'castillo / fortaleza' },
        { char: '下', reading: 'か', meaning: 'debajo / a los pies' },
        { char: '町', reading: 'まち', meaning: 'ciudad / villa' }
      ],
      breakdown_text: '城 (murallas de tierra 土 donde se hace 成 la defensa) + 下 (a los pies) + 町 (trazado urbano)',
      mnemonic: 'Las calles empedradas que florecieron bajo la sombra protectora de la fortaleza feudal.'
    }
  ],
  '36_2': [
    {
      kanji: '露天風呂',
      kana: 'ろてんぶろ',
      meaning: 'Baño onsen al aire libre en contacto con la naturaleza',
      onyomi: 'RO, TEN, FU, RO [ろ, てん, ふ, ろ]',
      kunyomi: 'tsuyu, ame [つゆ, あめ]',
      type: 'Jukugo',
      breakdown: [
        { char: '露', reading: 'ろ', meaning: 'rocío / al descubierto' },
        { char: '天', reading: 'てん', meaning: 'cielo' },
        { char: '風呂', reading: 'ふろ', meaning: 'tina de baño caliente' }
      ],
      breakdown_text: '露 (al descubierto bajo el rocío) + 天 (bóveda celeste) + 風呂 (baño termal)',
      mnemonic: 'Sumergirse en aguas calientes contemplando el manto de estrellas o el follaje otoñal.'
    }
  ],

  // === MÓDULO 37 ===
  '37_1': [
    {
      kanji: '担当',
      kana: 'たんとう',
      meaning: 'Responsable de área / Persona encargada',
      onyomi: 'TAN, TOU [たん, とう]',
      kunyomi: 'katsu(gu), a(taru) [かつ(ぐ), あ(たる)]',
      type: 'Jukugo',
      breakdown: [
        { char: '担', reading: 'たん', meaning: 'asumir sobre los hombros' },
        { char: '当', reading: 'とう', meaning: 'acertar / desempeñar' }
      ],
      breakdown_text: '扌 (mano firme) que sostiene la carga + 当 (ocupar el puesto de responsabilidad)',
      mnemonic: 'Asumir con profesionalismo y orgullo las tareas designadas en la organización.'
    }
  ],
  '37_2': [
    {
      kanji: '面接',
      kana: 'めんせつ',
      meaning: 'Entrevista formal de trabajo o admisión',
      onyomi: 'MEN, SETSU [めん, せつ]',
      kunyomi: 'tsura, tsu(gu) [つら, つ(ぐ)]',
      type: 'Jukugo',
      breakdown: [
        { char: '面', reading: 'めん', meaning: 'rostro / faz' },
        { char: '接', reading: 'せつ', meaning: 'hacer contacto / acercarse' }
      ],
      breakdown_text: '面 (rostro) + 接 (mano que une y conecta) → "entrevista presencial cara a cara"',
      mnemonic: 'Presentarse con rectitud y deferencia ante los evaluadores para exponer la propia vocación.'
    }
  ]
};

module.exports = { KANJI_JUKUGO_CATALOG };
