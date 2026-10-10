/**
 * scripts/m1_data/curriculum_functional_bridge.js
 * Catálogo completo de Componentes y Puentes Funcionales (Prefijos, Sufijos, Partículas)
 * para los 69 pasos de contenido temático en data/curriculum.json (Feature 4).
 */

const FUNCTIONAL_BRIDGE_CATALOG = {
  // === MÓDULO 1 ===
  '1_1': [
    {
      item: 'お- / ご-',
      name: 'Prefijos de Cortesía (Bikougo)',
      reading: 'お / ご',
      type: 'Prefijo',
      function_es: 'Embellecimiento y respeto sincero en fórmulas cotidianas y de cortesía',
      rule: 'Antepuesto a vocabulario de origen japonés nativo (Wago con お-) o sino-japonés (Kango con ご-).',
      examples: [
        {
          jp: 'おはようございます、田中さん。',
          kana: 'おはようございます、たなかさん。',
          es: 'Buenos días, señor Tanaka.'
        }
      ],
      link_url: '/grammar?filter=particles'
    },
    {
      item: '〜さん',
      name: 'Sufijo de Cortesía Social',
      reading: 'さん',
      type: 'Sufijo',
      function_es: 'Tratamiento honorífico y de respeto neutro hacia el interlocutor o terceras personas',
      rule: 'Se pospone al apellido o nombre de pila de otra persona; jamás se aplica al propio nombre.',
      examples: [
        {
          jp: 'こちらはマリアさんです。',
          kana: 'こちらはまりあさんです。',
          es: 'Ésta es la señorita María.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '1_2': [
    {
      item: 'は (wa)',
      name: 'Partícula Temática de Delimitación',
      reading: 'わ',
      type: 'Partícula',
      function_es: 'Delimita el tema central de la conversación ("en cuanto a X...") sobre el cual recae el predicado',
      rule: '[Sujeto / Tema] + は + [Información / Identidad / Predicado]. Se escribe con el kana は pero se pronuncia "wa".',
      examples: [
        {
          jp: '私は学生です。',
          kana: 'わたしはがくせいです。',
          es: 'En cuanto a mí, soy estudiante.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '1_3': [
    {
      item: 'か (ka)',
      name: 'Partícula Interrogativa Oracional',
      reading: 'か',
      type: 'Partícula',
      function_es: 'Convierte inmediatamente una oración declarativa en una pregunta formal directa',
      rule: 'Se añade al final de la oración tras です o ます sin necesidad de signo de interrogación tradicional.',
      examples: [
        {
          jp: 'お国はどちらですか。',
          kana: 'おくにはどちらですか。',
          es: '¿De qué país es usted?'
        }
      ],
      link_url: '/grammar?filter=particles'
    },
    {
      item: '〜人 (じん)',
      name: 'Sufijo de Nacionalidad y Gentilicio',
      reading: 'じん',
      type: 'Sufijo',
      function_es: 'Indica la nacionalidad o procedencia ciudadana de una persona',
      rule: '[Nombre del País en kanji o katakana] + 人 (pronunciado じん).',
      examples: [
        {
          jp: 'キムさんは韓国人です。',
          kana: 'きむさんはかんこくじんです。',
          es: 'El señor Kim es ciudadano coreano.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 2 ===
  '2_1': [
    {
      item: '〜語 (ご)',
      name: 'Sufijo Clasificador de Idiomas',
      reading: 'ご',
      type: 'Sufijo',
      function_es: 'Transforma el nombre de una nación o pueblo en su lengua correspondiente',
      rule: '[País / Cultura] + 語 (ej. 日本語 = japonés, 英語 = inglés, スペイン語 = español).',
      examples: [
        {
          jp: '英語が話せますか。',
          kana: 'えいごがはなせますか。',
          es: '¿Puede hablar en idioma inglés?'
        }
      ],
      link_url: '/grammar?filter=particles'
    },
    {
      item: 'で (de - Medio e Instrumento)',
      name: 'Partícula Instrumental y Lingüística',
      reading: 'で',
      type: 'Partícula',
      function_es: 'Indica el medio, herramienta o código idiomático a través del cual se ejecuta la comunicación',
      rule: '[Idioma / Medio] + で + [Verbo de comunicación o expresión].',
      examples: [
        {
          jp: '「Gato」は日本語で「ねこ」です。',
          kana: '「Gato」はにほんごで「ねこ」です。',
          es: '«Gato» en japonés se dice «neko».'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 3 ===
  '3_1': [
    {
      item: 'の (no - Conexión Nominal)',
      name: 'Partícula de Atribución y Posesión',
      reading: 'の',
      type: 'Partícula',
      function_es: 'Une dos sustantivos indicando que el primero califica, posee o contextualiza al segundo',
      rule: '[Sustantivo A (modificador)] + の + [Sustantivo B (núcleo)].',
      examples: [
        {
          jp: '私の電話番号はこれです。',
          kana: 'わたしのでんわばんごうはこれです。',
          es: 'Mi número de teléfono es éste.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '3_2': [
    {
      item: '〜人 (にん / り)',
      name: 'Contador de Personas',
      reading: 'にん / り',
      type: 'Sufijo',
      function_es: 'Cuantifica con precisión seres humanos con formas nativas irregulares en las primeras cifras',
      rule: '1人 (ひとり), 2人 (ふたり), 3人 (さんにん), 4人 (よにん)... y pregunta 何人 (なんにん).',
      examples: [
        {
          jp: '家族は三人です。',
          kana: 'かぞくはさんにんです。',
          es: 'En mi familia somos tres personas.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 4 ===
  '4_1': [
    {
      item: 'を (wo / o)',
      name: 'Partícula de Objeto Directo',
      reading: 'お',
      type: 'Partícula',
      function_es: 'Marca el objeto o paciente sobre el cual recae directamente la acción de un verbo transitivo',
      rule: '[Objeto / Alimento] + を + [Verbo transitivo (食べます, 飲みます)].',
      examples: [
        {
          jp: '毎朝パンを食べます。',
          kana: 'まいあさぱんをたべます。',
          es: 'Todas las mañanas como pan.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '4_2': [
    {
      item: 'が (ga - Objeto de Afecto)',
      name: 'Partícula de Preferencia con Adjetivos',
      reading: 'が',
      type: 'Partícula',
      function_es: 'Señala el elemento que suscita agrado, gusto o disgusto ante adjetivos como 好き y 嫌い',
      rule: '[Tema] は + [Elemento preferido] + が + 好きです / 嫌いです.',
      examples: [
        {
          jp: '私はうどんが好きです。',
          kana: 'わたしはうどんがすきです。',
          es: 'A mí me gustan los fideos udon.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 5 ===
  '5_1': [
    {
      item: 'を / お願いします',
      name: 'Fórmula de Solicitud en Pedidos',
      reading: 'おねがいします',
      type: 'Morfema',
      function_es: 'Expresa formalmente el deseo de ordenar un platillo o bebida al dependiente',
      rule: '[Platillo / Objeto] + を / + お願いします.',
      examples: [
        {
          jp: '生ビールをお願いします。',
          kana: 'なまびーるをおねがいします。',
          es: 'Una cerveza de barril, por favor.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '5_2': [
    {
      item: '〜つ (tsu)',
      name: 'Contador Nativo Universal Japonés',
      reading: 'つ',
      type: 'Sufijo',
      function_es: 'Contador general de origen autóctono para objetos inanimados del 1 al 10',
      rule: '一つ (ひとつ), 二つ (ふたつ), 三つ (みっつ), 四つ (よっつ)... y pregunta いくつ.',
      examples: [
        {
          jp: '枝豆二つお願いします。',
          kana: 'えだまめふたつおねがいします。',
          es: 'Dos porciones de edamame, por favor.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 6 ===
  '6_1': [
    {
      item: 'の (Ubicación Espacial)',
      name: 'Partícula de Relación Espacial en el Hogar',
      reading: 'の',
      type: 'Partícula',
      function_es: 'Conecta un espacio mayor o mueble con la posición relativa de sus componentes',
      rule: '[Lugar de referencia] + の + [Ubicación (中, 上, 近く)] + に.',
      examples: [
        {
          jp: '部屋の中に冷蔵庫があります。',
          kana: 'へやのなかにれいぞうこがあります。',
          es: 'Dentro de la habitación hay un refrigerador.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 7 ===
  '7_1': [
    {
      item: 'に (Lugar de Existencia)',
      name: 'Partícula de Ubicación Estática',
      reading: 'に',
      type: 'Partícula',
      function_es: 'Marca el punto estático donde existe o se encuentra un objeto inanimado o ser vivo',
      rule: '[Lugar] + に + [Sujeto] + が + [あります (inanimado) / います (animado)].',
      examples: [
        {
          jp: '机の上に本があります。',
          kana: 'つくえのうえにほんがあります。',
          es: 'Sobre la mesa hay un libro.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '7_2': [
    {
      item: 'や (ya)',
      name: 'Partícula de Enumeración No Exhaustiva',
      reading: 'や',
      type: 'Partícula',
      function_es: 'Lista dos o más elementos como muestra representativa sugiriendo que existen otros más',
      rule: '[Sustantivo A] + や + [Sustantivo B] (+ など).',
      examples: [
        {
          jp: '部屋には机や椅子があります。',
          kana: 'へやにはつくえやいすがあります。',
          es: 'En la habitación hay escritorios y sillas, entre otras cosas.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 8 ===
  '8_1': [
    {
      item: 'に (Punto Temporal Exacto)',
      name: 'Partícula de Tiempo Concreto',
      reading: 'に',
      type: 'Partícula',
      function_es: 'Marca la hora o día numérico concreto en que se produce una acción',
      rule: '[Hora / Cifra numérica temporal] + に + [Verbo de rutina].',
      examples: [
        {
          jp: '毎朝6時に起きます。',
          kana: 'まいあさろくじにおきます。',
          es: 'Todas las mañanas me levanto a las 6 en punto.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '8_2': [
    {
      item: 'から / まで',
      name: 'Partículas de Intervalo y Duración',
      reading: 'から / まで',
      type: 'Partícula',
      function_es: 'Delimitan el punto inicial (desde) y el punto final (hasta) en el tiempo o espacio',
      rule: '[Tiempo inicial] + から + [Tiempo final] + まで.',
      examples: [
        {
          jp: '昼休みは12時から1時までです。',
          kana: 'ひるやすみはじゅうにじからいちじまでです。',
          es: 'El receso del almuerzo es desde las 12 hasta la 1.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 9 ===
  '9_1': [
    {
      item: '〜てください',
      name: 'Fórmula de Solicitud Respetuosa',
      reading: 'てください',
      type: 'Morfema',
      function_es: 'Expresa una petición cortés o instrucción clara hacia el compañero de trabajo',
      rule: 'Verbo [Forma て] + ください (ej. 見てください, 手伝ってください).',
      examples: [
        {
          jp: 'すみません、ちょっと手伝ってください。',
          kana: 'すみません、ちょっとてつだってください。',
          es: 'Disculpe, por favor ayúdeme un momento.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 10 ===
  '10_1': [
    {
      item: 'を (Objeto de Ocio)',
      name: 'Marcador de Actividades Recreativas',
      reading: 'お',
      type: 'Partícula',
      function_es: 'Vincula la afición o material con el verbo sensorial o recreativo correspondiente',
      rule: '[Deporte / Afición / Libro / Música] + を + [Verbo].',
      examples: [
        {
          jp: 'たいてい映画を見ます。',
          kana: 'たいていえいがをみます。',
          es: 'Por lo general veo películas.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '10_2': [
    {
      item: 'と (Compañía Recíproca)',
      name: 'Partícula de Compañía Social',
      reading: 'と',
      type: 'Partícula',
      function_es: 'Indica la persona o compañero junto a quien se comparte y realiza una actividad',
      rule: '[Persona / Amigo] + と + (いっしょに) + [Verbo].',
      examples: [
        {
          jp: '休みの日は夫とテニスをします。',
          kana: 'やすみのひはおっととてにすをします。',
          es: 'En los días libres juego al tenis con mi esposo.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 11 ===
  '11_1': [
    {
      item: '〜ませんか / 〜ましょう',
      name: 'Fórmulas de Invitación y Propuesta Cordial',
      reading: 'ませんか / ましょう',
      type: 'Morfema',
      function_es: '〜ませんか invita respetuosamente dando opción a rechazo; 〜ましょう propone con entusiasmo',
      rule: 'Verbo [Raíz Masu] + ませんか (invitación) / ましょう (propuesta entusiasta).',
      examples: [
        {
          jp: 'いっしょに夏祭りに行きませんか。',
          kana: 'いっしょになつまつりにいきませんか。',
          es: '¿No le gustaría ir juntos al festival de verano?'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 12 ===
  '12_1': [
    {
      item: 'へ / に (Dirección y Destino)',
      name: 'Partículas de Dirección de Movimiento',
      reading: 'え / に',
      type: 'Partícula',
      function_es: 'Señalan el punto geográfico hacia el cual se desplaza el hablante con verbos de traslación',
      rule: '[Destino geográfico] + へ (se pronuncia "e") / に + [行きます / 来ます / 帰ります].',
      examples: [
        {
          jp: '毎朝学校へ行きます。',
          kana: 'まいあさがっこうへいきます。',
          es: 'Todas las mañanas voy a la escuela.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '12_2': [
    {
      item: 'で (Medio de Transporte)',
      name: 'Partícula Instrumental de Movilidad',
      reading: 'で',
      type: 'Partícula',
      function_es: 'Especifica el medio mecánico o vehículo mediante el cual se realiza el trayecto',
      rule: '[Vehículo / Tren / Autobús] + で + [Verbo de desplazamiento].',
      examples: [
        {
          jp: '東京から京都まで新幹線で行きました。',
          kana: 'とうきょうからきょうとまでしんかんせんでいきました。',
          es: 'Fui desde Tokio hasta Kioto en tren bala.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '12_3': [
    {
      item: 'に (Abordar) / を (Descender)',
      name: 'Partículas de Embarque y Descenso',
      reading: 'に / お',
      type: 'Partícula',
      function_es: 'Marca el vehículo al que se sube (に) y el vehículo del cual se desciende (を)',
      rule: '[Vehículo] + に乗る / [Vehículo] + を降りる.',
      examples: [
        {
          jp: '次の駅で電車を降ります。',
          kana: 'つぎのえきででんしゃをおります。',
          es: 'Bajaré del tren en la siguiente estación.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 13 ===
  '13_1': [
    {
      item: 'を (Espacio Atravesado)',
      name: 'Partícula de Trayectoria Urbana',
      reading: 'お',
      type: 'Partícula',
      function_es: 'Indica el espacio físico, vía o intersección que se cruza o atraviesa en movimiento continuo',
      rule: '[Punto urbano: 橋, 交差点, 角] + を + [渡る, 曲がる, 通る].',
      examples: [
        {
          jp: '信号を渡って、次の角を右に曲がります。',
          kana: 'しんごうをわたって、つぎのかどをみぎにまがります。',
          es: 'Cruce el semáforo y gire a la derecha en la siguiente esquina.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 14 ===
  '14_1': [
    {
      item: 'は (Búsqueda Temática)',
      name: 'Partícula Temática de Localización Comercial',
      reading: 'わ',
      type: 'Partícula',
      function_es: 'Aísla el producto o sección que busca el comprador en grandes almacenes',
      rule: '[Artículo / Sección comercial] + はどこですか.',
      examples: [
        {
          jp: '靴売り場はどこですか。',
          kana: 'くつうりばはどこですか。',
          es: '¿Dónde se encuentra la sección de calzado?'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 15 ===
  '15_1': [
    {
      item: 'で (Totalidad y Conjunto Monetario)',
      name: 'Partícula de Suma y Condición Global',
      reading: 'で',
      type: 'Partícula',
      function_es: 'Indica la cifra global o suma total que engloba a todo el conjunto de compras',
      rule: '全部 + で + [Cifra en yenes] です.',
      examples: [
        {
          jp: '全部で千五百円になります。',
          kana: 'ぜんぶでせんごひゃくえんになります。',
          es: 'En total son mil quinientos yenes.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 16 ===
  '16_1': [
    {
      item: '〜ました / 〜ませんでした',
      name: 'Flexión Formal de Pasado Verbal',
      reading: 'ました / ませんでした',
      type: 'Morfema',
      function_es: 'Señala acciones completadas afirmativas o negativas en un tiempo pretérito formal',
      rule: 'Verbo [Raíz Masu] + ました (afirmativo) / ませんでした (negativo).',
      examples: [
        {
          jp: 'とても早く起きました。',
          kana: 'とてもはやくおきました。',
          es: 'Me levanté muy temprano.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '16_2': [
    {
      item: '〜かった / 〜でした',
      name: 'Pasado de Adjetivos い y な',
      reading: 'かった / でした',
      type: 'Morfema',
      function_es: 'Conjugan en pasado las cualidades y estados de ánimo vividos',
      rule: 'Adjetivo-い (reemplazar い por かった) / Adjetivo-な + でした.',
      examples: [
        {
          jp: '映画はとても楽しかったです。',
          kana: 'えいがはとてもたのしかったです。',
          es: 'La película estuvo muy divertida.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '16_3': [
    {
      item: '〜たり〜たりします',
      name: 'Enumeración Representativa de Acciones',
      reading: 'たり〜たりします',
      type: 'Morfema',
      function_es: 'Muestra dos o tres acciones como ejemplos típicos de lo realizado sin orden cronológico estricto',
      rule: 'Verbo 1 [Forma た] + り + Verbo 2 [Forma た] + りします / しました.',
      examples: [
        {
          jp: '富士山を見たり、お寿司を食べたりしました。',
          kana: 'ふじさんをみたり、おすしをたべたりしました。',
          es: 'Contemplé el monte Fuji y comí sushi, entre otras actividades.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 17 ===
  '17_1': [
    {
      item: '〜たい (Deseo de Acción)',
      name: 'Sufijo Volitivo de Deseo Personal',
      reading: 'たい',
      type: 'Sufijo',
      function_es: 'Expresa el deseo personal en primera persona de realizar una acción',
      rule: 'Verbo [Raíz Masu] + たい (です) (ej. 行きたい, 食べたい).',
      examples: [
        {
          jp: 'ゴールデンウィークに温泉に入りたいです。',
          kana: 'ごーるでんうぃーくにおんせんにはいりたいです。',
          es: 'Quiero entrar a un baño onsen durante la Golden Week.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '17_2': [
    {
      item: 'に (Propósito de Movimiento)',
      name: 'Partícula de Finalidad y Objetivo',
      reading: 'に',
      type: 'Partícula',
      function_es: 'Indica la meta u objetivo para el cual el sujeto se desplaza hacia un destino',
      rule: '[Sustantivo de actividad / Verbo en raíz Masu] + に + [行きます / 来ます].',
      examples: [
        {
          jp: '週末に友だちと映画を見に行きました。',
          kana: 'しゅうまつにともだちとえいがをみにいきました。',
          es: 'El fin de semana fui con amigos a ver una película.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 18 ===
  '18_1': [
    {
      item: 'が (Localización de Síntomas)',
      name: 'Partícula Marcadora del Foco Corporal',
      reading: 'が',
      type: 'Partícula',
      function_es: 'Resalta la parte del cuerpo donde se manifiesta un dolor o anomalía fisiológica',
      rule: '[Parte anatómica] + が + [痛い / 悪い / 熱がある].',
      examples: [
        {
          jp: '頭が痛くて、熱があります。',
          kana: 'あたまがいたくて、ねつがあります。',
          es: 'Me duele la cabeza y tengo fiebre.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '18_2': [
    {
      item: '〜なければなりません',
      name: 'Estructura de Deber y Obligación Ineludible',
      reading: 'なければなりません',
      type: 'Morfema',
      function_es: 'Indica que una acción es indispensable y obligatoria por prescripción médica o norma',
      rule: 'Verbo [Forma ない, sustituir い por ければなりません].',
      examples: [
        {
          jp: '今日は仕事を休まなければなりません。',
          kana: 'きょうはしごとをやすまなければなりません。',
          es: 'Hoy debo faltar al trabajo obligatoriamente.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 19 ===
  '19_1': [
    {
      item: 'お- / ご- (Bikougo de Gratitud)',
      name: 'Prefijos de Deferencia y Gratitud',
      reading: 'お / ご',
      type: 'Prefijo',
      function_es: 'Embellecimiento y respeto sincero al expresar agradecimiento por favores recibidos en despedidas',
      rule: 'Antepuesto a "世話" (お世話) y "元気" (お元気) para dirigirse con respeto al bienestar ajeno.',
      examples: [
        {
          jp: '今まで大変お世話になりました。',
          kana: 'いままでたいへんおせわになりました。',
          es: 'Muchísimas gracias por todas sus atenciones hasta el día de hoy.'
        }
      ],
      link_url: '/grammar?filter=particles'
    },
    {
      item: 'に (Cambio de Estado)',
      name: 'Partícula de Transformación y Meta',
      reading: 'に',
      type: 'Partícula',
      function_es: 'Marca el estado, profesión o condición a la que se aspira llegar con el verbo なる (volverse)',
      rule: '[Sustantivo / Adjetivo な] + に + なります (ej. 先生になる / 上手になる).',
      examples: [
        {
          jp: '日本語教師になるのが夢です。',
          kana: 'にほんごきょうしになるのがゆめです。',
          es: 'Mi sueño es llegar a ser profesor de japonés.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 20 ===
  '20_1': [
    {
      item: '〜ばかり (Pasado Inmediato Subjetivo)',
      name: 'Estructura de Acción Recién Concluida',
      reading: 'ばかり',
      type: 'Morfema',
      function_es: 'Expresa que una acción acaba de ocurrir en la percepción temporal subjetiva del hablante',
      rule: 'Verbo [Forma た] + ばかり (です / の時).',
      examples: [
        {
          jp: '先週日本に来たばかりです。',
          kana: 'せんしゅうにほんにきたばかりです。',
          es: 'Acabo de llegar a Japón la semana pasada.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '20_2': [
    {
      item: '〜そう (Juicio Visual Inmediato)',
      name: 'Sufijo de Conjetura por Apariencia',
      reading: 'そう',
      type: 'Sufijo',
      function_es: 'Indica la impresión subjetiva intuitiva basada directamente en lo observado en el rostro o actitud',
      rule: 'Adjetivo-い (quitar い) / Adjetivo-な (sin な) + そう (です).',
      examples: [
        {
          jp: 'あの人は親切そうで、仕事が早そうです。',
          kana: 'あのひとはしんせつそうで、しごとがはやそうです。',
          es: 'Aquella persona parece amable y parece rápida trabajando.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 21 ===
  '21_1': [
    {
      item: 'が (Marcador en Forma Potencial)',
      name: 'Partícula de Objeto de Capacidad',
      reading: 'が',
      type: 'Partícula',
      function_es: 'Reemplaza típicamente a を cuando el verbo pasa a Forma Potencial (capacidad o posibilidad)',
      rule: '[Alimento / Tarea] + が + [Verbo en Forma Potencial: 食べられる, 読める].',
      examples: [
        {
          jp: '生魚が食べられますか。',
          kana: 'なまざかながたべられますか。',
          es: '¿Puede comer pescado crudo?'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '21_2': [
    {
      item: '〜ないで (Instrucción de Omisión)',
      name: 'Fórmula Imperativa de Exclusión',
      reading: 'ないで',
      type: 'Morfema',
      function_es: 'Pide o instruye no incorporar un ingrediente o no realizar una acción determinada',
      rule: 'Verbo [Forma ない] + で (ください).',
      examples: [
        {
          jp: 'わさびを入れないで作ってください。',
          kana: 'わさびをいれないでつくってください。',
          es: 'Por favor prepárelo sin ponerle wasabi.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 22 ===
  '22_1': [
    {
      item: '〜たほうがいい',
      name: 'Fórmula de Recomendación Preventiva',
      reading: 'たほうがいい',
      type: 'Morfema',
      function_es: 'Aconseja con firmeza realizar una acción para prevenir inconvenientes en el viaje',
      rule: 'Verbo [Forma た] + ほうがいい (ですよ).',
      examples: [
        {
          jp: '新幹線は早く予約したほうがいいですよ。',
          kana: 'しんかんせんははやくよやくしたほうがいいですよ。',
          es: 'Es mejor que reserves el Shinkansen con antelación.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '22_2': [
    {
      item: '〜てよかった',
      name: 'Expresión de Alivio y Satisfacción Retrospectiva',
      reading: 'てよかった',
      type: 'Morfema',
      function_es: 'Evalúa positivamente una experiencia pasada manifestando alegría por haberla vivido',
      rule: 'Verbo [Forma て] / Potencial [Forma て] + よかった (です).',
      examples: [
        {
          jp: '地元の人とたくさん話せてよかったです。',
          kana: 'じもとのひととたくさんはなせてよかったです。',
          es: 'Me alegré mucho de haber podido conversar bastante con la gente local.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 23 ===
  '23_1': [
    {
      item: '〜たら (Condicional Temporal e Hipotético)',
      name: 'Estructura Condicional de Consecuencia',
      reading: 'たら',
      type: 'Morfema',
      function_es: 'Establece que si se cumple una circunstancia previa, se adoptará una medida derivada',
      rule: 'Verbo [Forma た] + ら / Adjetivo-い [かった] + ら.',
      examples: [
        {
          jp: '天気が悪かったら、来週に延期します。',
          kana: 'てんきがわるかったら、らいしゅうにえんきします。',
          es: 'Si el tiempo empeora, se pospondrá para la próxima semana.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '23_2': [
    {
      item: '〜か (Pregunta Indirecta Embebida)',
      name: 'Incrustador de Cláusulas Interrogativas',
      reading: 'か',
      type: 'Partícula',
      function_es: 'Inserta una duda o pregunta parcial dentro de una oración matriz compleja',
      rule: 'Interrogativo + [Verbo en Forma Informal] + か + [分かります / 教えてください].',
      examples: [
        {
          jp: 'ごみ箱がどこにあるか分かりますか？',
          kana: 'ごみばこがどこにあるかわかりますか？',
          es: '¿Sabe usted dónde está la papelera?'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 24 ===
  '24_1': [
    {
      item: '〜たらいいですか',
      name: 'Solicitud Formal de Asesoramiento Protocolario',
      reading: 'たらいいですか',
      type: 'Morfema',
      function_es: 'Pregunta qué conducta, prenda o proceder es el idóneo para no cometer faltas de etiqueta',
      rule: 'Interrogativo / Verbo [Forma たら] + いいですか / いいでしょうか.',
      examples: [
        {
          jp: 'どんなネクタイを締めていったらいいですか？',
          kana: 'どんなねくたいをしめていったらいいですか？',
          es: '¿Qué tipo de corbata debería llevar puesta?'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '24_2': [
    {
      item: 'お- (Bikougo Ceremonial)',
      name: 'Prefijo Reverencial de Fiestas y Ritos',
      reading: 'お',
      type: 'Prefijo',
      function_es: 'Consagra las costumbres de Año Nuevo confiriéndoles su categoría sagrada tradicional',
      rule: 'Antepuesto a vocablos tradicionales: お正月 (Año Nuevo), おせち (comida ritual), お年玉.',
      examples: [
        {
          jp: 'お正月に神社へ初詣に行きます。',
          kana: 'おしょうがつにじんじゃへはつもうでにいきます。',
          es: 'En Año Nuevo vamos al santuario para la primera visita ritual del año.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 25 ===
  '25_1': [
    {
      item: '〜やすい / 〜にくい',
      name: 'Sufijos de Facilidad y Dificultad Instrumental',
      reading: 'やすい / にくい',
      type: 'Sufijo',
      function_es: 'Modifican la raíz verbal indicando que una acción es fácil o difícil de realizar operativamente',
      rule: 'Verbo [Raíz Masu] + やすい (fácil) / にくい (difícil / resistente).',
      examples: [
        {
          jp: 'この靴は滑りにくくて安全です。',
          kana: 'このくつはすべりにくくてあんぜんです。',
          es: 'Estos zapatos no resbalan con facilidad y son seguros.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '25_2': [
    {
      item: 'のを (Nominalización de Olvidos)',
      name: 'Partícula Nominalizadora de Acciones',
      reading: 'のを',
      type: 'Partícula',
      function_es: 'Convierte una cláusula verbal en un sustantivo para ser gobernada por verbos como 忘れる',
      rule: 'Verbo [Forma Diccionario] + のを + 忘れました.',
      examples: [
        {
          jp: '鍵をかけるのを忘れました。',
          kana: 'かぎをかけるのをわすれました。',
          es: 'Olvidé cerrar con llave.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 26 ===
  '26_1': [
    {
      item: '〜てある (Estado Resultante Premeditado)',
      name: 'Estructura de Acción Intencional Previa',
      reading: 'てある',
      type: 'Morfema',
      function_es: 'Describe que un objeto permanece en un estado óptimo preparado de antemano con un propósito',
      rule: '[Lugar] に + [Objeto] が + Verbo transitivo [Forma て] + ある / あります.',
      examples: [
        {
          jp: '机の上に資料が並べてあります。',
          kana: 'つくえのうえにしりょうがならべてあります。',
          es: 'Sobre la mesa están ordenados los documentos.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '26_2': [
    {
      item: '〜てもらえますか',
      name: 'Petición Atenuada de Servicio Profesional',
      reading: 'てもらえますか',
      type: 'Morfema',
      function_es: 'Formula solicitudes de atención personalizada con cortesía en peluquerías o trámites',
      rule: 'Verbo [Forma て] + もらえますか / いただけますか.',
      examples: [
        {
          jp: '横の髪を少しすいてもらえますか？',
          kana: 'よこのかみをすこしすいてもらえますか？',
          es: '¿Podría vaciarme un poco el cabello de los lados?'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 27 ===
  '27_1': [
    {
      item: '〜たまま (Persistencia de Estado)',
      name: 'Estructura de Continuidad Inalterada',
      reading: 'たまま',
      type: 'Morfema',
      function_es: 'Indica que un estado anterior persiste indebidamente o sin cerrarse al pasar a otra acción',
      rule: 'Verbo [Forma た] + まま (にする / にしないでください).',
      examples: [
        {
          jp: 'ドアを開けたままにしないでください。',
          kana: 'どあをあけたままにしないでください。',
          es: 'Por favor, no deje la puerta abierta.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '27_2': [
    {
      item: '〜まで (Límite Temporal en Emergencias)',
      name: 'Partícula de Término de Evento Natural',
      reading: 'まで',
      type: 'Partícula',
      function_es: 'Establece el hito o cese de una conmoción hasta el cual se debe mantener la protección',
      rule: 'Verbo [Forma Diccionario] + まで + 待つ / 行動する.',
      examples: [
        {
          jp: '頭を保護して、揺れが収まるまで待ちましょう。',
          kana: 'あたまをほごして、ゆれがおさまるまでまちましょう。',
          es: 'Protejamos la cabeza y esperemos hasta que pase el temblor.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 28 ===
  '28_1': [
    {
      item: '〜ようになる',
      name: 'Estructura de Evolución de Facultades',
      reading: 'ようになる',
      type: 'Morfema',
      function_es: 'Describe la transición paulatina desde la incapacidad inicial hasta la adquisición de destrezas',
      rule: 'Verbo [Forma Diccionario / Forma Potencial] + ようになる.',
      examples: [
        {
          jp: '日本の習慣が理解できるようになりました。',
          kana: 'にほんのしゅうかんがりかいできるようになりました。',
          es: 'He llegado a ser capaz de comprender las costumbres japonesas.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '28_2': [
    {
      item: '〜(よ)うと思っている',
      name: 'Expresión de Planes con Forma Volitiva',
      reading: 'ようとおもっている',
      type: 'Morfema',
      function_es: 'Declara una determinación personal o plan deliberado madurado a lo largo del tiempo',
      rule: 'Verbo [Forma Volitiva] + と思っている / と思います.',
      examples: [
        {
          jp: '来年、JLPTのN3を受験しようと思っています。',
          kana: 'らいねん、JLPTのN3をじゅけんしようとおもっています。',
          es: 'Pienso presentarme al examen JLPT N3 el año próximo.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 29 ===
  '29_1': [
    {
      item: '〜って / 〜っけ',
      name: 'Cita Coloquial y Confirmación Retrospectiva',
      reading: 'って / っけ',
      type: 'Partícula',
      function_es: '〜って resalta el tema en registro informal; 〜っけ formula preguntas para refrescar la memoria',
      rule: '[Tema / Cláusula] + って / [Verbo en Pasado た] + っけ.',
      examples: [
        {
          jp: '来週のライブのチケットって、もう取ったんだっけ？',
          kana: 'らいしゅうのらいぶのちけっとって、もうとったんだっけ？',
          es: 'Oye, ¿las entradas para el concierto de la semana que viene ya las habíamos comprado?'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '29_2': [
    {
      item: '〜のが一番 (Superlativo Subjetivo)',
      name: 'Estructura de Preferencia Crítica',
      reading: 'のがいちばん',
      type: 'Morfema',
      function_es: 'Eleva una obra, género o escena al rango de favorita indiscutible según el criterio propio',
      rule: '[Obra / Género / Acción] + が / のが一番 + 好き / 感動的.',
      examples: [
        {
          jp: 'この漫画は主人公の成長が描かれていて感動的です。',
          kana: 'このまんがはしゅじんこうのせいちょうがかかれていてかんどうてきです。',
          es: 'Este manga describe el crecimiento del protagonista y resulta muy emotivo.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 30 ===
  '30_1': [
    {
      item: '〜みたいだ (Conjetura Sensorial Directa)',
      name: 'Morfema de Deducción Inmediata',
      reading: 'みたいだ',
      type: 'Morfema',
      function_es: 'Formula una hipótesis basada en la observación intuitiva directa de una falla o situación',
      rule: '[Forma Informal / Sustantivo] + みたいだ (みたいなので).',
      examples: [
        {
          jp: '鍵の調子が悪いみたいなので、見てもらえますか？',
          kana: 'かぎのちょうしがわるいみたいなので、みてもらえますか？',
          es: 'Parece que la cerradura no funciona bien; ¿podría revisarla?'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '30_2': [
    {
      item: '〜ていただけないでしょうか',
      name: 'Petición Deferente en Gestiones de Vivienda',
      reading: 'ていただけないでしょうか',
      type: 'Morfema',
      function_es: 'Máxima cortesía formal para solicitar información o condiciones especiales en inmobiliarias',
      rule: 'Verbo [Forma て] + いただけないでしょうか.',
      examples: [
        {
          jp: '南向きで日当たりの良い部屋を希望しています。',
          kana: 'みなみむきでひあたりのよいへやをきぼうしています。',
          es: 'Deseo una habitación orientada al sur y con buena luz solar.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 31 ===
  '31_1': [
    {
      item: '〜ようにしている',
      name: 'Estructura de Disciplina y Esfuerzo Consciente',
      reading: 'ようにしている',
      type: 'Morfema',
      function_es: 'Denota un compromiso activo y continuado del hablante por mantener un hábito nutricional',
      rule: 'Verbo [Forma Diccionario / Forma ない] + ようにしている.',
      examples: [
        {
          jp: '塩分を取りすぎないように気をつけています。',
          kana: 'えんぶんをとりすぎないようにきをつけています。',
          es: 'Tengo cuidado de no consumir exceso de sal.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '31_2': [
    {
      item: '〜ならでは (Exclusividad Regional)',
      name: 'Morfema de Identidad Gastronómica Autóctona',
      reading: 'ならでは',
      type: 'Morfema',
      function_es: 'Resalta que una cualidad culinaria solo puede disfrutarse genuinamente en esa comarca',
      rule: '[Región / Lugar] + ならではの + [Platillo / Sabor].',
      examples: [
        {
          jp: '讃岐うどんの本場のコシを味わってください。',
          kana: 'さぬきうどんのほんばのこしをあじわってください。',
          es: 'Deguste la firmeza auténtica de los fideos Sanuki Udon en su tierra de origen.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 32 ===
  '32_1': [
    {
      item: '〜たらいいな (Anhelo Armónico Empático)',
      name: 'Estructura de Deseo Comunitario Suave',
      reading: 'たらいいな',
      type: 'Morfema',
      function_es: 'Expresa una aspiración cordial y armónica de buena convivencia sin presionar al interlocutor',
      rule: 'Verbo [Forma たら] + いいな / いいですね.',
      examples: [
        {
          jp: 'お互いに助け合える関係になれたらいいですね。',
          kana: 'おたがいにたすけあえるかんけいになれたらいいですね。',
          es: 'Sería estupendo si pudiéramos forjar una relación donde nos apoyemos mutuamente.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '32_2': [
    {
      item: '〜てもかまわない (Permiso Tolerante)',
      name: 'Fórmula de Concesión Comprensiva',
      reading: 'てもかまわない',
      type: 'Morfema',
      function_es: 'Retira la duda o timidez del interlocutor autorizándolo a disponer de algo libremente',
      rule: 'Verbo [Forma て] + もかまわない / どうぞ遠慮なく.',
      examples: [
        {
          jp: 'どうぞ遠慮なくお使いください。',
          kana: 'どうぞえんりょなくおつかいください。',
          es: 'Por favor, utilícelo con total libertad y sin reparos.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 33 ===
  '33_1': [
    {
      item: '〜をきっかけに (Detonante Motivacional)',
      name: 'Estructura de Catalizador de Aprendizaje',
      reading: 'をきっかけに',
      type: 'Morfema',
      function_es: 'Señala el evento, encuentro o experiencia casual que dio inicio a una trayectoria vocacional',
      rule: '[Sustantivo / Cláusula nominalizada con の] + をきっかけに (して).',
      examples: [
        {
          jp: '友人に誘われたのをきっかけに、茶道を習い始めました。',
          kana: 'ゆうじんにさそわれたのをきっかけに、さどうをならいはじめました。',
          es: 'A raíz de que me invitó un amigo, empecé a aprender la ceremonia del té.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '33_2': [
    {
      item: '〜ことによって (Metodología Causal Instrumental)',
      name: 'Conector de Eficiencia Formal',
      reading: 'ことによって',
      type: 'Morfema',
      function_es: 'Expresa el método técnico mediante el cual se alcanza un resultado óptimo en el estudio',
      rule: 'Verbo [Forma Diccionario] + ことによって / ことにより.',
      examples: [
        {
          jp: 'アプリを活用することによって、隙間時間を有効に使えます。',
          kana: 'あぷりをかつようすることによって、すきまじかんをゆうこうにつかえます。',
          es: 'A través del aprovechamiento de aplicaciones, se pueden aprovechar los tiempos muertos de forma productiva.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 34 ===
  '34_1': [
    {
      item: '〜てほしい (Petición de Auxilio y Deseo en Terceros)',
      name: 'Estructura Volitiva sobre Acciones Ajenas',
      reading: 'てほしい',
      type: 'Morfema',
      function_es: 'Expresa el deseo imperioso de que otra persona actúe con urgencia ante un riesgo',
      rule: '[Sujeto ajeno に] + Verbo [Forma て] + ほしい (です).',
      examples: [
        {
          jp: '危険ですから、すぐにここから離れてほしいです。',
          kana: 'きけんですから、すぐにここからはなれてほしいです。',
          es: 'Es peligroso, así que necesito que se alejen de aquí inmediatamente.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '34_2': [
    {
      item: '〜に注意する / 〜に相談する',
      name: 'Fórmulas de Prevención Ciudadana y Denuncia',
      reading: 'にちゅういする / にそうだんする',
      type: 'Morfema',
      function_es: 'Guía la conducta ciudadana ante cobros ilícitos y estafas financieras',
      rule: '[Entidad / Situación] + に + 注意してください / 相談しましょう.',
      examples: [
        {
          jp: '身に覚えのない請求が来たら、消費者センターに相談しましょう。',
          kana: 'みにおぼえのないせいきゅうがきたら、しょうひしゃせんたーにそうだんしましょう。',
          es: 'Si le llega un cobro que no reconoce, consulte con la oficina del consumidor.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 35 ===
  '35_1': [
    {
      item: 'ご- / お- (Solemne) & 〜申し上げます',
      name: 'Fórmulas Honoríficas de Enhorabuena',
      reading: 'もうしあげます',
      type: 'Morfema',
      function_es: 'Tratamiento de máxima deferencia al emitir felicitaciones en ceremonias solemnes de boda',
      rule: 'ご結婚おめでとうございます / [Sustantivo honorífico] + 申し上げます.',
      examples: [
        {
          jp: 'ご結婚おめでとうございます。末永くお幸せに。',
          kana: 'ごけっこんおめでとうございます。すえながくおしあわせに。',
          es: 'Felicidades por su boda; sean felices por siempre.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '35_2': [
    {
      item: '〜てみたらどうですか',
      name: 'Sugerencia Empática Prudencial',
      reading: 'てみたらどうですか',
      type: 'Morfema',
      function_es: 'Propone una vía de solución comprensiva a un amigo sin imponer la propia opinión',
      rule: 'Verbo [Forma て] + みたらどうですか / 相談してください.',
      examples: [
        {
          jp: '困ったときはいつでも私に相談してくださいね。',
          kana: 'こまったときはいつでもわたしにそうだんしてくださいね。',
          es: 'Cuando tengas problemas, consúltame en cualquier momento.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 36 ===
  '36_1': [
    {
      item: '〜てみたい (Deseo Experimental)',
      name: 'Estructura Volitiva de Vivencia Directa',
      reading: 'てみたい',
      type: 'Morfema',
      function_es: 'Expresa el anhelo de vivir en primera persona una experiencia cultural o gastronómica',
      rule: 'Verbo [Forma て] + みたい (です / んです).',
      examples: [
        {
          jp: '歴史ある城下町の街並みを散策してみたいです。',
          kana: 'れきしあるじょうかまちのまちなみをさんさくしてみたいです。',
          es: 'Me gustaría pasear por las calles de una histórica ciudad señorial con castillo.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '36_2': [
    {
      item: '〜てもらえました (Beneficio en Servicios)',
      name: 'Narrativa de Agradecimiento por Atención Recibida',
      reading: 'てもらえました',
      type: 'Morfema',
      function_es: 'Relata con gratitud una mejora de servicio concedida con amabilidad por el personal hotelero',
      rule: 'Verbo [Forma て] + もらえました / いただきました.',
      examples: [
        {
          jp: '露天風呂付きの部屋にグレードアップしてもらえました。',
          kana: 'ろてんぶろつきのへやにぐれーどあっぷしてもらえました。',
          es: 'Pudieron hacernos una mejora a una habitación con baño al aire libre incluido.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],

  // === MÓDULO 37 ===
  '37_1': [
    {
      item: '〜について (Delimitación Temática Formal)',
      name: 'Conector de Materia y Normativa Laboral',
      reading: 'について',
      type: 'Partícula',
      function_es: 'Enfoca la explicación sobre una directriz, reglamento o proceso de trabajo específico',
      rule: '[Normativa / Asunto] + について + [確認する / 説明する].',
      examples: [
        {
          jp: '安全衛生規則について、しっかり確認しておいてください。',
          kana: 'あんぜんえいせいきそくについて、しっかりかくにんしておいてください。',
          es: 'Por favor, asegúrese de revisar a fondo las normas de seguridad e higiene.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ],
  '37_2': [
    {
      item: '〜させていただければ (Causativo Humilde Deferente)',
      name: 'Fórmula de Modestia en Postulación Laboral',
      reading: 'させていただければ',
      type: 'Morfema',
      function_es: 'Solicita con suma humildad la venia del tribunal evaluador para colaborar en la empresa',
      rule: 'Verbo [Forma Causativa て] + いただければ / 機会をいただき.',
      examples: [
        {
          jp: '本日は面接の機会をいただき、誠にありがとうございます。',
          kana: 'ほんじつはめんせつのきかいをいただき、まことにありがとうございます。',
          es: 'Muchas gracias sinceramente por brindarme la oportunidad de esta entrevista el día de hoy.'
        }
      ],
      link_url: '/grammar?filter=particles'
    }
  ]
};

module.exports = { FUNCTIONAL_BRIDGE_CATALOG };
