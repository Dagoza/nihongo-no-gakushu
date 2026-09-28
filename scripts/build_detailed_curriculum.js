const fs = require('fs');
const path = require('path');

const curriculum = [
  {
    step: 1,
    title: "Nivel 1: Primeros Pasos y Saludos Cotidianos",
    subtitle: "Dominando los saludos, la cortesía y la fonética",
    stage: "Fundamentos",
    icon: "🌸",
    tab: "vocab",
    sourcePdf: "4. Hiragana Vocabulary Flashcard.pdf & japones from spanish.pdf (Lección 1-2)",
    objectives: [
      "Aprender a saludar y presentarse formalmente en japonés (こんにちは, はじめまして)",
      "Uso de la cópula です y la negación ではありません / ではない",
      "Comprender la partícula は como marcador del tema de conversación",
      "Saludar de acuerdo al momento del día (mañana, tarde, despedida)"
    ],
    detailed_guide: "En japonés, presentarse adecuadamente marca el tono de toda relación interpersonal. El patrón básico de autoidentificación es: 【A は B です】 (En cuanto a A, es B). La partícula は se escribe con el carácter 'ha', pero se pronuncia 'wa' cuando actúa como marcador del tema. Para negar se utiliza 【ではありません】 (formal) o 【じゃありません】 (coloquial).",
    grammar_focus: [
      "Partícula は (Topic Marker - Marcador de tema principal)",
      "A は B です / ではありません (Afirmación y negación de identidad)",
      "Partícula か (Interrogativa - transforma la frase en pregunta)",
      "Fórmulas de cortesía: はじめまして、どうぞよろしくお願いします"
    ],
    included_vocab: [
      "こんにちは", "おはよう", "ありがとう", "すみません", 
      "さようなら", "私", "人", "学生", "先生", "はじめまして", "どうぞ"
    ],
    vocab_details: [
      { kanji: "私", kana: "わたし", romaji: "watashi", meaning: "Yo / Primera persona", type: "Pronombre" },
      { kanji: "人", kana: "ひと", romaji: "hito", meaning: "Persona", type: "Sustantivo" },
      { kanji: "学生", kana: "がくせい", romaji: "gakusei", meaning: "Estudiante", type: "Sustantivo" },
      { kanji: "先生", kana: "せんせい", romaji: "sensei", meaning: "Profesor / Maestro", type: "Sustantivo" },
      { kanji: "こんにちは", kana: "こんにちは", romaji: "konnichiwa", meaning: "Hola / Buenas tardes", type: "Saludo" },
      { kanji: "おはようございます", kana: "おはようございます", romaji: "ohayou gozaimasu", meaning: "Buenos días (formal)", type: "Saludo" },
      { kanji: "すみません", kana: "すみません", romaji: "sumimasen", meaning: "Disculpe / Perdón / Gracias", type: "Expresión" },
      { kanji: "ありがとう", kana: "ありがとう", romaji: "arigatou", meaning: "Gracias", type: "Expresión" }
    ],
    examples: [
      {
        jp: "はじめまして。私はアンナです。",
        kana: "はじめまして。わたしはアンナです。",
        romaji: "Hajimemashite. Watashi wa Anna desu.",
        es: "Mucho gusto. Soy Anna.",
        explanation: "Fórmula canónica de presentación en Japón. はじめまして proviene del verbo 'comenzar' (hajimeru)."
      },
      {
        jp: "さくらさんは学生ではありません。",
        kana: "さくらさんはがくせいではありません。",
        romaji: "Sakura-san wa gakusei dewa arimasen.",
        es: "Sakura no es estudiante.",
        explanation: "Uso de ではありません para negar la identidad o condición de una persona."
      },
      {
        jp: "田中さんは先生ですか。",
        kana: "たなかさんはせんせいですか。",
        romaji: "Tanaka-san wa sensei desu ka.",
        es: "¿El señor Tanaka es profesor?",
        explanation: "Añadir か al final de la oración equivale gramaticalmente al signo de interrogación."
      },
      {
        jp: "どうぞよろしくおねがいします。",
        kana: "どうぞよろしくおねがいします。",
        romaji: "Douzo yoroshiku onegai shimasu.",
        es: "Encantado de conocerle / Por favor cuide de mí.",
        explanation: "Expresión indispensable de humildad y respeto en todo primer encuentro."
      }
    ],
    exercises: [
      {
        id: "cur_1_1",
        question: "¿Cómo te presentas diciendo 'Soy estudiante'?",
        sentence: "私は (　) です。",
        options: ["学生", "先生", "人", "本"],
        correct: "学生",
        explanation: "学生 (gakusei) significa estudiante."
      },
      {
        id: "cur_1_2",
        question: "¿Cuál es la partícula que marca el tema principal de la oración?",
        sentence: "私 (　) アンナです。",
        options: ["は", "を", "に", "で"],
        correct: "は",
        explanation: "は (wa) marca el tema del que se habla."
      },
      {
        id: "cur_1_3",
        question: "¿Cómo se dice 'De nada' tras recibir un agradecimiento?",
        sentence: "どう (　) 。",
        options: ["いたしまして", "ぞよろしく", "もありがとう", "はよう"],
        correct: "いたしまして",
        explanation: "どういたしまして (douitashimashite) es la respuesta formal a arigatou gozaimasu."
      }
    ]
  },
  {
    step: 2,
    title: "Nivel 2: Números, Días, Meses y la Partícula の",
    subtitle: "Aprender a contar, decir fechas y expresar posesión",
    stage: "Esencial",
    icon: "📅",
    tab: "vocab",
    sourcePdf: "Kanji book.pdf & N5 vocabulary nouns.pdf (Págs 10-18 Calendario y Números)",
    objectives: [
      "Contar con fluidez del 1 al 10,000 en japonés y dominar los kanjis numéricos",
      "Nombrar los 7 días de la semana y los meses del año",
      "Conectar sustantivos para expresar posesión, origen y pertenencia con の",
      "Dar información de contacto como el número telefónico"
    ],
    detailed_guide: "Los números en japonés son de base decimal muy regular: 11 es 十一 (10+1), 20 es 二十 (2x10). La partícula 【の】 (no) conecta dos sustantivos, actuando análogamente al 'de' en español: 【A の B】 significa 'el B de A' (私のかばん = mi bolso / 日本語の本 = libro de japonés). En números telefónicos, el guión '-' se lee en voz alta como 'の'.",
    grammar_focus: [
      "Sustantivo A + の + Sustantivo B (Posesión / Atribución)",
      "Lecturas numéricas Sino-japonesas (Ichi, Ni, San) y Nativas (Hitotsu, Futatsu)",
      "Días de la semana basados en los elementos naturales (Sol, Luna, Fuego, Agua, Madera, Metal, Tierra)"
    ],
    included_vocab: [
      "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
      "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日",
      "今日", "今", "電話番号", "本"
    ],
    vocab_details: [
      { kanji: "一", kana: "いち", romaji: "ichi", meaning: "Uno", type: "Número" },
      { kanji: "二", kana: "に", romaji: "ni", meaning: "Dos", type: "Número" },
      { kanji: "三", kana: "さん", romaji: "san", meaning: "Tres", type: "Número" },
      { kanji: "四", kana: "よん / し", romaji: "yon / shi", meaning: "Cuatro", type: "Número" },
      { kanji: "五", kana: "ご", romaji: "go", meaning: "Cinco", type: "Número" },
      { kanji: "十", kana: "じゅう", romaji: "juu", meaning: "Diez", type: "Número" },
      { kanji: "月曜日", kana: "げつようび", romaji: "getsuyoubi", meaning: "Lunes (Día de la Luna)", type: "Día" },
      { kanji: "日曜日", kana: "にちようび", romaji: "nichiyoubi", meaning: "Domingo (Día del Sol)", type: "Día" },
      { kanji: "今日", kana: "きょう", romaji: "kyou", meaning: "Hoy", type: "Tiempo" },
      { kanji: "電話番号", kana: "でんわばんごう", romaji: "denwabangou", meaning: "Número de teléfono", type: "Sustantivo" }
    ],
    examples: [
      {
        jp: "これは日本語の本です。",
        kana: "これはにほんごのほんです。",
        romaji: "Kore wa nihongo no hon desu.",
        es: "Este es un libro de japonés.",
        explanation: "La partícula の califica al sustantivo 本 (libro) indicando su materia o contenido."
      },
      {
        jp: "今日は月曜日です。",
        kana: "きょうはげつようびです。",
        romaji: "Kyou wa getsuyoubi desu.",
        es: "Hoy es lunes.",
        explanation: "Oración simple para indicar la fecha y día actual."
      },
      {
        jp: "アンナさんの電話番号は何番ですか。",
        kana: "アンナさんのでんわばんごうはなんばんですか。",
        romaji: "Anna-san no denwabangou wa nanban desu ka.",
        es: "¿Cuál es el número de teléfono de Anna?",
        explanation: "何番 (nanban) se usa para interrogar por números de serie, teléfono o habitación."
      }
    ],
    exercises: [
      {
        id: "cur_2_1",
        question: "¿Cómo se dice 'Mi libro'?",
        sentence: "私 (　) 本です。",
        options: ["の", "は", "に", "を"],
        correct: "の",
        explanation: "私 (yo) + の + 本 (libro) expresa posesión: 'mi libro'."
      },
      {
        id: "cur_2_2",
        question: "¿Qué día de la semana corresponde a 金曜日 (kin'youbi)?",
        sentence: "明日は金曜日です。",
        options: ["Viernes", "Lunes", "Miércoles", "Domingo"],
        correct: "Viernes",
        explanation: "金曜日 representa el día del oro/metal: Viernes."
      },
      {
        id: "cur_2_3",
        question: "¿Qué número representa el kanji 七?",
        sentence: "部屋番号は七です。",
        options: ["7", "6", "8", "9"],
        correct: "7",
        explanation: "七 se lee なな (nana) o しち (shichi) y representa el 7."
      }
    ]
  },
  {
    step: 3,
    title: "Nivel 3: Objetos, Lugares y Existencia (ある vs いる)",
    subtitle: "Demostrativos y dónde están las cosas y personas",
    stage: "Estructuras",
    icon: "⛩️",
    tab: "grammar",
    sourcePdf: "7. N5 Japanese Particles Checklist.xlsx & N5 vocabulary nouns.pdf (Lugares y Muebles)",
    objectives: [
      "Dominar la serie demostrativa Ko-So-A-Do (これ/それ/あれ/どれ y ここ/そこ/あそこ/どこ)",
      "Distinguir con precisión el uso de あります (inanimados) e います (seres animados)",
      "Estructurar oraciones de localización usando la partícula に (posición) y が (existencia)"
    ],
    detailed_guide: "En japonés hay una distinción fundamental para decir 'haber/estar': 【ある (あります)】 se reserva para objetos inanimados, plantas o conceptos abstractos. 【いる (います)】 se utiliza exclusivamente para personas y animales que se mueven por voluntad propia. La estructura clásica es: 【[Lugar] に [Sujeto] が あります/います】.",
    grammar_focus: [
      "あります (Existencia inanimada: cosas, lugares, plantas)",
      "います (Existencia animada: personas, animales)",
      "Lugar に Sujeto が あります/います",
      "Demostrativos de lugar: ここ (aquí), そこ (ahí), あそこ (allá), どこ (dónde)"
    ],
    included_vocab: [
      "家", "部屋", "学校", "駅", "店", "本", "机", "木", 
      "ある", "いる", "ここ", "そこ", "どこ", "猫", "犬"
    ],
    vocab_details: [
      { kanji: "部屋", kana: "へや", romaji: "heya", meaning: "Habitación / Cuarto", type: "Lugar" },
      { kanji: "机", kana: "つくえ", romaji: "tsukue", meaning: "Escritorio / Mesa de estudio", type: "Objeto" },
      { kanji: "学校", kana: "がっこう", romaji: "gakkou", meaning: "Escuela", type: "Lugar" },
      { kanji: "駅", kana: "えき", romaji: "eki", meaning: "Estación de tren", type: "Lugar" },
      { kanji: "猫", kana: "ねこ", romaji: "neko", meaning: "Gato", type: "Animal" },
      { kanji: "犬", kana: "いぬ", romaji: "inu", meaning: "Perro", type: "Animal" },
      { kanji: "ある", kana: "ある", romaji: "aru", meaning: "Haber / Estar (cosas)", type: "Verbo" },
      { kanji: "いる", kana: "いる", romaji: "iru", meaning: "Estar / Haber (seres vivos)", type: "Verbo" }
    ],
    examples: [
      {
        jp: "机の上に本があります。",
        kana: "つくえのうえにほんがあります。",
        romaji: "Tsukue no ue ni hon ga arimasu.",
        es: "Hay un libro encima del escritorio.",
        explanation: "El libro es un objeto inanimado, por lo que se utiliza あります precedido de la partícula が."
      },
      {
        jp: "部屋の中に猫がいます。",
        kana: "へやのなかにねこがいます。",
        romaji: "Heya no naka ni neko ga imasu.",
        es: "Hay un gato dentro de la habitación.",
        explanation: "El gato es un ser vivo animado, por lo que se utiliza います."
      },
      {
        jp: "トイレはどこですか。すぐそこです。",
        kana: "トイレはどこですか。すぐそこです。",
        romaji: "Toire wa doko desu ka. Sugu soko desu.",
        es: "¿Dónde está el baño? Está justo ahí al lado.",
        explanation: "Pregunta común de localización extraída de la lección 3 de NHK."
      }
    ],
    exercises: [
      {
        id: "cur_3_1",
        question: "Completa la frase para decir: 'Hay un perro en el parque'.",
        sentence: "公園に犬が (　) 。",
        options: ["います", "あります", "します", "いきます"],
        correct: "います",
        explanation: "El perro (犬) es un ser vivo, requiere el verbo います (existencia animada)."
      },
      {
        id: "cur_3_2",
        question: "¿Qué partícula marca el lugar exacto de existencia estática?",
        sentence: "机 (　) パソコンがあります。",
        options: ["に", "で", "を", "へ"],
        correct: "に",
        explanation: "La partícula に indica el punto exacto donde reside o se encuentra un objeto."
      },
      {
        id: "cur_3_3",
        question: "¿Cómo se dice '¿Dónde está la estación?'?",
        sentence: "駅は (　) ですか。",
        options: ["どこ", "だれ", "なに", "いつ"],
        correct: "どこ",
        explanation: "どこ (doko) significa 'dónde'."
      }
    ]
  },
  {
    step: 4,
    title: "Nivel 4: Verbos de Acción y la Partícula を",
    subtitle: "Lo que comemos, bebemos, leemos y hacemos a diario",
    stage: "Comunicación",
    icon: "🍱",
    tab: "vocab",
    sourcePdf: "N5 vocabulary verbs.pdf & N5 vocabulary nouns.pdf (Comidas y Bebidas)",
    objectives: [
      "Aprender los verbos transitivos más frecuentes en forma cortés ます (polite)",
      "Marcar el objeto directo con la partícula を (pronunciada 'o')",
      "Diferenciar la partícula で (lugar de acción dinámica) de la partícula に (lugar estático)",
      "Expresar compañía usando la partícula と (con)"
    ],
    detailed_guide: "Los verbos japoneses siempre van al final de la oración (sujeto + objeto + verbo). La partícula 【を】 (wo/o) marca el objeto que recibe la acción directa: 【ご飯を食べます】 (comer arroz/comida). El lugar donde ocurre la acción física se señala con 【で】: 【レストランで食べます】 (comer en el restaurante).",
    grammar_focus: [
      "Objeto + を + Verbo transitivo (Marcador de objeto directo)",
      "Lugar + で + Verbo de acción dinámica",
      "Persona + と + Verbo (Compañía: 'junto con')",
      "Forma presente/futura ます y su negación ません"
    ],
    included_vocab: [
      "食べる", "飲む", "読む", "書く", "聞く", "話す", "買う",
      "ご飯", "水", "お茶", "魚", "肉", "パン", "友達"
    ],
    vocab_details: [
      { kanji: "食べる", kana: "たべる", romaji: "taberu (tabemasu)", meaning: "Comer", type: "Verbo Ichidan" },
      { kanji: "飲む", kana: "のむ", romaji: "nomu (nomimasu)", meaning: "Beber / Tomar medicina", type: "Verbo Godan" },
      { kanji: "読む", kana: "よむ", romaji: "yomu (yomimasu)", meaning: "Leer", type: "Verbo Godan" },
      { kanji: "書く", kana: "かく", romaji: "kaku (kakimasu)", meaning: "Escribir", type: "Verbo Godan" },
      { kanji: "買う", kana: "かう", romaji: "kau (kaimasu)", meaning: "Comprar", type: "Verbo Godan" },
      { kanji: "ご飯", kana: "ごはん", romaji: "gohan", meaning: "Arroz cocido / Comida", type: "Sustantivo" },
      { kanji: "お茶", kana: "おちゃ", romaji: "ocha", meaning: "Té verde japonés", type: "Bebida" },
      { kanji: "友達", kana: "ともだち", romaji: "tomodachi", meaning: "Amigo / Amiga", type: "Persona" }
    ],
    examples: [
      {
        jp: "毎朝、パンを食べて、コーヒーを飲みます。",
        kana: "まいあさ、パンをたべて、コーヒーをのみます。",
        romaji: "Maiasa, pan o tabete, koohii o nomimasu.",
        es: "Cada mañana como pan y tomo café.",
        explanation: "Pan y café son objetos directos marcados con を."
      },
      {
        jp: "図書館で日本語を勉強します。",
        kana: "としょかんでにほんごをべんきょうします。",
        romaji: "Toshokan de nihongo o benkyou shimasu.",
        es: "Estudio japonés en la biblioteca.",
        explanation: "Se usa で porque estudiar es una actividad dinámica, no una simple presencia estática."
      },
      {
        jp: "友達と映画を見ました。",
        kana: "ともだちとえいがをみました。",
        romaji: "Tomodachi to eiga o mimashita.",
        es: "Vi una película con un amigo.",
        explanation: "友達と indica la persona que acompaña la acción."
      }
    ],
    exercises: [
      {
        id: "cur_4_1",
        question: "¿Qué partícula se utiliza para señalar la comida que consumes?",
        sentence: "朝ご飯 (　) 食べます。",
        options: ["を", "は", "に", "で"],
        correct: "を",
        explanation: "を marca el objeto directo del verbo 食べる (comer)."
      },
      {
        id: "cur_4_2",
        question: "¿Cuál es el significado de '水を飲みます'?",
        sentence: "水を飲みます。",
        options: ["Bebo agua", "Como carne", "Compro un libro", "Leo el periódico"],
        correct: "Bebo agua",
        explanation: "水 (mizu) es agua y 飲む (nomu) es beber."
      },
      {
        id: "cur_4_3",
        question: "Completa la frase: 'Estudio en la escuela con un amigo'.",
        sentence: "学校 (　) 友達 (　) 勉強します。",
        options: ["で / と", "に / を", "へ / から", "の / が"],
        correct: "で / と",
        explanation: "で indica el lugar de estudio y と indica la compañía."
      }
    ]
  },
  {
    step: 5,
    title: "Nivel 5: Movimiento, Tiempo y Partículas に, へ, から, まで",
    subtitle: "Desplazarse en tren, horarios y direcciones",
    stage: "Movimiento",
    icon: "🚅",
    tab: "grammar",
    sourcePdf: "7. N5 Japanese Particles Checklist.xlsx & N5 vocabulary nouns.pdf (Transporte y Horas)",
    objectives: [
      "Expresar origen y destino con から (desde) y まで (hasta)",
      "Indicar la dirección y meta del movimiento con へ e に con verbos 行く, 来る, 帰る",
      "Marcar el punto específico de tiempo con la partícula に (a las 8:00, el lunes)",
      "Indicar el medio de transporte con で (en tren, en autobús)"
    ],
    detailed_guide: "Los verbos de desplazamiento como 行く (ir), 来る (venir) y 帰る (regresar) requieren marcar el destino con 【へ】 (se lee 'e') o con 【に】. El medio de locomoción se marca con 【で】 (電車で = en tren). Para expresar rangos de tiempo o distancia física se utiliza la pareja correlativa 【から】 (desde) y 【まで】 (hasta).",
    grammar_focus: [
      "Destino + へ / に + 行く / 来る / 帰る",
      "Punto de partida から Punto final まで (Espacio y Tiempo)",
      "Tiempo específico + に + Acción",
      "Medio de transporte + で (電車で, バスで, 車で)"
    ],
    included_vocab: [
      "行く", "来る", "帰る", "乗る", "出る", "電車", 
      "車", "道", "午前", "午後", "時間", "から", "まで", "駅"
    ],
    vocab_details: [
      { kanji: "行く", kana: "いく", romaji: "iku (ikimasu)", meaning: "Ir", type: "Verbo de movimiento" },
      { kanji: "来る", kana: "くる", romaji: "kuru (kimasu)", meaning: "Venir", type: "Verbo irregular" },
      { kanji: "帰る", kana: "かえる", romaji: "kaeru (kaerimasu)", meaning: "Regresar (a casa/patria)", type: "Verbo Godan" },
      { kanji: "電車", kana: "でんしゃ", romaji: "densha", meaning: "Tren eléctrico", type: "Transporte" },
      { kanji: "車", kana: "くるま", romaji: "kuruma", meaning: "Automóvil / Carro", type: "Transporte" },
      { kanji: "時間", kana: "じかん", romaji: "jikan", meaning: "Tiempo / Hora", type: "Sustantivo" },
      { kanji: "午前", kana: "ごぜん", romaji: "gozen", meaning: "a.m. / Mañana", type: "Tiempo" },
      { kanji: "午後", kana: "ごご", romaji: "gogo", meaning: "p.m. / Tarde", type: "Tiempo" }
    ],
    examples: [
      {
        jp: "毎朝八時に電車で学校へ行きます。",
        kana: "まいあさはちじにでんしゃでがっこうへいきます。",
        romaji: "Maiasa hachi-ji ni densha de gakkou e ikimasu.",
        es: "Cada mañana a las 8 voy a la escuela en tren.",
        explanation: "Combina tiempo (八時に), medio de transporte (電車で) y meta de movimiento (学校へ)."
      },
      {
        jp: "東京から京都まで新幹線で行きました。",
        kana: "とうきょうからきょうとまでしんかんせんでいきました。",
        romaji: "Toukyou kara Kyouto made shinkansen de ikimashita.",
        es: "Fui desde Tokio hasta Kioto en Shinkansen.",
        explanation: "Estructura から...まで aplicada a desplazamiento geográfico."
      },
      {
        jp: "授業は九時から十二時半までです。",
        kana: "じゅぎょうはくじからじゅうにじはんまでです。",
        romaji: "Jugyou wa ku-ji kara juu ni-ji han made desu.",
        es: "La clase es de 9:00 a 12:30.",
        explanation: "Estructura から...まで aplicada a límites temporales de horario."
      }
    ],
    exercises: [
      {
        id: "cur_5_1",
        question: "¿Qué partícula señala el medio de transporte usado para viajar?",
        sentence: "新幹線 (　) 大阪に行きます。",
        options: ["で", "に", "を", "へ"],
        correct: "で",
        explanation: "で indica el instrumento o medio de transporte empleado."
      },
      {
        id: "cur_5_2",
        question: "¿Cómo se dice 'desde las 9 hasta las 5'?",
        sentence: "９時 (　) ５時 (　) 働きます。",
        options: ["から / まで", "に / へ", "で / と", "を / が"],
        correct: "から / まで",
        explanation: "から significa 'desde' y まで significa 'hasta'."
      },
      {
        id: "cur_5_3",
        question: "Elige la partícula correcta para dirigirse a casa: うち (　) 帰ります。",
        sentence: "午後６時にうち (　) 帰ります。",
        options: ["へ", "で", "を", "から"],
        correct: "へ",
        explanation: "へ (o に) indica la dirección o meta del verbo 帰る (regresar)."
      }
    ]
  },
  {
    step: 6,
    title: "Nivel 6: Describir el Mundo con Adjetivos (い y な)",
    subtitle: "Expresar opiniones, características y comparaciones",
    stage: "Expresión",
    icon: "🎨",
    tab: "kanji",
    sourcePdf: "N5 vocabulary adjectives.pdf & kanji to print.pdf (Adjetivos y Antónimos)",
    objectives: [
      "Distinguir claramente las dos clases de adjetivos: adjetivos-い y adjetivos-な",
      "Conjugar adjetivos al negativo (〜くない / 〜ではない) y al pasado (〜かった)",
      "Conectar adjetivos con la forma -te (〜くて / 〜で) para unir cualidades",
      "Hacer comparaciones con より ('más que') y の方が ('la opción de')"
    ],
    detailed_guide: "Los adjetivos japoneses se dividen en dos grupos: Adjetivos-い (terminan en い como 大きい, 高い) que se conjugan directamente en su raíz (negativo: 高くない, pasado: 高かった); y Adjetivos-な (como 静か, 元気) que requieren 'な' cuando van antes de un sustantivo (静かな部屋) y funcionan como sustantivos con です al final.",
    grammar_focus: [
      "Adjetivo-い: Afirmativo, Negativo (-くない), Pasado (-かった)",
      "Adjetivo-な + な + Sustantivo / Adjetivo-な + です",
      "Forma -te conectiva: 〜くて / 〜で (Barato y delicioso = 安くて美味しい)",
      "Comparaciones: A より B の方が [Adjetivo] です (B es más [Adj] que A)"
    ],
    included_vocab: [
      "大きい", "小さい", "高い", "安い", "新しい", "古い", 
      "良い", "悪い", "暑い", "寒い", "冷たい", "静か", "元気", "美味しい"
    ],
    vocab_details: [
      { kanji: "大きい", kana: "おおきい", romaji: "ookii", meaning: "Grande", type: "Adjetivo-い" },
      { kanji: "小さい", kana: "ちいさい", romaji: "chiisai", meaning: "Pequeño", type: "Adjetivo-い" },
      { kanji: "高い", kana: "たかい", romaji: "takai", meaning: "Alto / Caro", type: "Adjetivo-い" },
      { kanji: "安い", kana: "やすい", romaji: "yasui", meaning: "Barato / Económico", type: "Adjetivo-い" },
      { kanji: "美味しい", kana: "おいしい", romaji: "oishii", meaning: "Delicioso / Sabroso", type: "Adjetivo-い" },
      { kanji: "静か", kana: "しずか", romaji: "shizuka", meaning: "Tranquilo / Silencioso", type: "Adjetivo-な" },
      { kanji: "元気", kana: "げんき", romaji: "genki", meaning: "Saludable / Con energía", type: "Adjetivo-な" },
      { kanji: "親切", kana: "しんせつ", romaji: "shinsetsu", meaning: "Amable / Atento", type: "Adjetivo-な" }
    ],
    examples: [
      {
        jp: "この店のラーメンは安くて、とても美味しいです。",
        kana: "このみせのラーメンはやすくて、とてもおいしいです。",
        romaji: "Kono mise no raamen wa yasukute, totemo oishii desu.",
        es: "El ramen de esta tienda es barato y muy sabroso.",
        explanation: "Uso de la forma -te de 安い (やすくて) para coordinar dos adjetivos positivos."
      },
      {
        jp: "京都はとても静かで、綺麗な町です。",
        kana: "きょうとはとてもしずかで、きれいなまちです。",
        romaji: "Kyouto wa totemo shizuka de, kirei na machi desu.",
        es: "Kioto es una ciudad muy tranquila y hermosa.",
        explanation: "El adjetivo-な 静か usa で para conectarse con 綺麗, el cual añade な ante el sustantivo 町."
      },
      {
        jp: "富士山は近くで見ると、本当に大きいです。",
        kana: "ふじさんはちかくでみると、ほんとうにおおきいです。",
        romaji: "Fujisan wa chikaku de miru to, hontou ni ookii desu.",
        es: "El monte Fuji, cuando lo ves de cerca, es verdaderamente grande.",
        explanation: "Frase célebre de la lección 29 de NHK para describir el imponente paisaje de Shizuoka."
      }
    ],
    exercises: [
      {
        id: "cur_6_1",
        question: "¿Cómo se niega el adjetivo 高い (caro) para decir 'no es caro'?",
        sentence: "この本は (　) です。",
        options: ["高くない", "高いない", "高いくありません", "高かった"],
        correct: "高くない",
        explanation: "Para negar un adjetivo-い se reemplaza la 'い' final por 'くない' (takakunai)."
      },
      {
        id: "cur_6_2",
        question: "¿Cómo se une '静か' (tranquilo) con una ciudad (町)?",
        sentence: "ここは (　) 町です。",
        options: ["静かな", "静かい", "静かで", "静かに"],
        correct: "静かな",
        explanation: "Los adjetivos-な requieren la partícula copulativa 'な' al modificar un sustantivo."
      },
      {
        id: "cur_6_3",
        question: "¿Qué significa '富士山は大きいです'?",
        sentence: "富士山は大きいです。",
        options: ["El Monte Fuji es grande", "El Monte Fuji es pequeño", "El Monte Fuji es peligroso", "El Monte Fuji está lejos"],
        correct: "El Monte Fuji es grande",
        explanation: "大きい (ookii) significa grande."
      }
    ]
  },
  {
    step: 7,
    title: "Nivel 7: Historia Integral 'Un Día en Japón' (Parte 1 y 2)",
    subtitle: "Lectura interactiva, pronunciación y desglose palabra por palabra",
    stage: "Consolidación",
    icon: "📖",
    tab: "story",
    sourcePdf: "Nihongo story.pages (Capítulo 1: La Llegada & Capítulo 2: Despertar en Tokio)",
    objectives: [
      "Leer comprensivamente los capítulos 1 y 2 de la historia original en japonés natural",
      "Escuchar la pronunciación nativa y entrenar el oído al ritmo natural de la lengua",
      "Aprender expresiones de rutina diaria: despertarse temprano, asearse y salir de casa",
      "Comprender la cronología con fechas (四月一日 - Primero de Abril)"
    ],
    detailed_guide: "Este nivel integra todo el vocabulario elemental en una narrativa vivencial continuada: la llegada de un estudiante a Japón a principios de primavera (época de cerezos y nuevo año escolar). El estudiante experimenta el choque cultural, la emoción de ver el cielo matutino de Tokio y el inicio de su rutina diaria.",
    grammar_focus: [
      "Lectura fluida y alternancia entre Furigana / Hiragana",
      "Verbos de rutina: 起きます (despertar), 顔を洗う (lavarse la cara), 出かけます (salir)",
      "Lecturas especiales del calendario: 一日 (ついたち - primer día del mes)",
      "Adverbios de tiempo y modo: 早く (temprano), 少し (un poco)"
    ],
    included_vocab: [
      "今年", "外国", "遠い", "四月一日", "早く", 
      "起きます", "天気", "空", "白い雲", "顔を洗う", "春", "桜"
    ],
    vocab_details: [
      { kanji: "今年", kana: "ことし", romaji: "kotoshi", meaning: "Este año", type: "Tiempo" },
      { kanji: "外国", kana: "がいこく", romaji: "gaikoku", meaning: "País extranjero / Exterior", type: "Sustantivo" },
      { kanji: "遠い", kana: "とおい", romaji: "tooi", meaning: "Lejano / Lejos", type: "Adjetivo-い" },
      { kanji: "四月一日", kana: "しがつついたち", romaji: "shigatsu tsuitachi", meaning: "Primero de abril", type: "Fecha" },
      { kanji: "天気", kana: "てんき", romaji: "tenki", meaning: "Clima / Tiempo meteorológico", type: "Sustantivo" },
      { kanji: "空", kana: "そら", romaji: "sora", meaning: "Cielo", type: "Naturaleza" },
      { kanji: "白い雲", kana: "しろいくも", romaji: "shiroi kumo", meaning: "Nubes blancas", type: "Naturaleza" }
    ],
    examples: [
      {
        jp: "今年、私は遠い外国から日本へ来ました。",
        kana: "ことし、わたしはとおいがいこくからにほんへきました。",
        romaji: "Kotoshi, watashi wa tooi gaikoku kara Nihon e kimashita.",
        es: "Este año vine a Japón desde un país extranjero y lejano.",
        explanation: "Oración inaugural de la historia. Integra 从 (kara) y へ (hacia)."
      },
      {
        jp: "四月一日の朝、私はとても早く起きました。",
        kana: "しがつついたちのあさ、わたしはとてもはやくおきました。",
        romaji: "Shigatsu tsuitachi no asa, watashi wa totemo hayaku okimashita.",
        es: "La mañana del primero de abril, me desperté muy temprano.",
        explanation: "Lectura especial del día 1 (ついたち) y adverbialización de 早く (temprano)."
      },
      {
        jp: "空は青くて、白い雲が少しありました。",
        kana: "そらはあおくて、しろいくもがすこしありました。",
        romaji: "Sora wa aokute, shiroi kumo ga sukoshi arimashita.",
        es: "El cielo era azul y había algunas nubes blancas.",
        explanation: "Conexión descriptiva con forma -te (青くて) y existencia de nubes (ありました)."
      }
    ],
    exercises: [
      {
        id: "cur_7_1",
        question: "¿Cómo se lee en japonés la fecha '1 de abril'?",
        sentence: "今日は (　) です。",
        options: ["しがつついたち", "よんがついちにち", "しがつひとつ", "よんがつついたち"],
        correct: "しがつついたち",
        explanation: "El primer día del mes se pronuncia irregularmente como ついたち (tsuitachi)."
      },
      {
        id: "cur_7_2",
        question: "¿Cuál es el significado de '空は青くて、白い雲がありました'?",
        sentence: "空は青くて、白い雲がありました。",
        options: ["El cielo era azul y había nubes blancas", "El mar estaba tranquilo y frío", "La casa era grande y blanca", "El tren llegó muy temprano"],
        correct: "El cielo era azul y había nubes blancas",
        explanation: "空 (cielo) es azul (青くて) y hay nubes blancas (白い雲)."
      },
      {
        id: "cur_7_3",
        question: "Traduce al japonés la acción de rutina: 'Lavarse la cara'.",
        sentence: "朝、(　) を洗います。",
        options: ["顔 (かお)", "手 (て)", "足 (あし)", "目 (め)"],
        correct: "顔 (かお)",
        explanation: "顔 (kao) significa cara / rostro; 顔を洗う es lavarse la cara."
      }
    ]
  },
  {
    step: 8,
    title: "Nivel 8: Historia Integral (Capítulos 3 y 4) y Estructuras N4",
    subtitle: "La escuela, planes con amigos y gramática de nivel superior",
    stage: "Puente a Intermedio",
    icon: "🎓",
    tab: "story",
    sourcePdf: "Nihongo story.pages (Capítulo 3: En el Aula & Capítulo 4: Planes con Amigos)",
    objectives: [
      "Comprender interacciones en el aula entre profesores y estudiantes internacionales",
      "Aprender a expresar probabilidad e incertidumbre con 〜かもしれません (puede que / tal vez)",
      "Dar consejos y recomendaciones constructivas usando 〜方がいい (es mejor que...)",
      "Utilizar la condición natural o inevitable con la partícula と"
    ],
    detailed_guide: "En los capítulos 3 y 4, la narrativa se eleva hacia situaciones donde los personajes deben tomar decisiones, evaluar dificultades de estudio y proponer planes turísticos. Aparecen estructuras de nivel N4 indispensables como la sugerencia prudente (〜た方がいい) y la deducción probabilística (〜かもしれません).",
    grammar_focus: [
      "〜かもしれません (Posibilidad o duda: 'puede que...')",
      "Forma pasada + 方がいいです (Recomendación: 'es mejor que...')",
      "Condicional natural: Verbo forma diccionario + と (Al hacer A, inevitablemente ocurre B)",
      "Expresión de sensaciones: 気持ちがいい (Se siente bien / da gusto)"
    ],
    included_vocab: [
      "勉強", "先生方", "机", "字", "易しい", "難しい", 
      "面白い", "空気", "気持ちがいい", "車で行く", "足湯", "温泉"
    ],
    vocab_details: [
      { kanji: "先生方", kana: "せんせいがた", romaji: "senseigata", meaning: "Los profesores (plural honorífico)", type: "Sustantivo" },
      { kanji: "易しい", kana: "やさしい", romaji: "yasashii", meaning: "Fácil / Sencillo", type: "Adjetivo-い" },
      { kanji: "難しい", kana: "むずかしい", romaji: "muzukashii", meaning: "Difícil / Complicado", type: "Adjetivo-い" },
      { kanji: "面白い", kana: "おもしろい", romaji: "omoshiroi", meaning: "Interesante / Divertido", type: "Adjetivo-い" },
      { kanji: "空気", kana: "くうき", romaji: "kuuki", meaning: "Aire / Atmósfera", type: "Sustantivo" },
      { kanji: "気持ちがいい", kana: "きもちがいい", romaji: "kimochi ga ii", meaning: "Agradable / Qué bien se siente", type: "Expresión" }
    ],
    examples: [
      {
        jp: "明日は雨が降るかもしれませんから、傘を持っていった方がいいです。",
        kana: "あしたはあめがふるかもしれませんから、かさをもっていったほうがいいです。",
        romaji: "Ashita wa ame ga furu kamoshiremasen kara, kasa o motte itta hou ga ii desu.",
        es: "Como puede que llueva mañana, es mejor que lleves paraguas.",
        explanation: "Combina 〜かもしれません (posibilidad) con 〜方がいい (recomendación)."
      },
      {
        jp: "温泉に足を入れると、とても気持ちがいいです。",
        kana: "おんせんにあしをいれると、とてもきもちがいいです。",
        romaji: "Onsen ni ashi o ireru to, totemo kimochi ga ii desu.",
        es: "Cuando metes los pies en las aguas termales, se siente muy agradable.",
        explanation: "El condicional と expresa una causa y efecto sensorial directo e inmediato."
      },
      {
        jp: "日本語の漢字は難しいですが、とても面白いです。",
        kana: "にほんごのかんじはむずかしいですが、とてもおもしろいです。",
        romaji: "Nihongo no kanji wa muzukashii desu ga, totemo omoshiroi desu.",
        es: "Los kanjis del japonés son difíciles, pero muy interesantes.",
        explanation: "Contraste de opiniones usando la conjunción が (pero)."
      }
    ],
    exercises: [
      {
        id: "cur_8_1",
        question: "¿Qué estructura se usa para sugerir: 'Es mejor que vayas al médico'?",
        sentence: "病院に (　) 方がいいです。",
        options: ["行った", "行く", "行かない", "行きます"],
        correct: "行った",
        explanation: "Para recomendar una acción afirmativa se utiliza el verbo en forma pasada -ta + 方がいい."
      },
      {
        id: "cur_8_2",
        question: "¿Qué expresa la terminación '〜かもしれません'?",
        sentence: "彼は来ないかもしれません。",
        options: ["Tal vez / Posibilidad", "Obligación absoluta", "Habilidad o permiso", "Petición cordial"],
        correct: "Tal vez / Posibilidad",
        explanation: "かもしれません indica una posibilidad estimada (quizás / puede ser)."
      },
      {
        id: "cur_8_3",
        question: "¿Qué significa '足を入れると気持ちがいい'?",
        sentence: "足を入れると気持ちがいい。",
        options: ["Al meter los pies se siente muy bien", "Caminar mucho cansa las piernas", "El agua está demasiado caliente", "Mis zapatos son nuevos y cómodos"],
        correct: "Al meter los pies se siente muy bien",
        explanation: "足 (pies) + 入れる (meter) + と (cuando) + 気持ちがいい (se siente muy bien)."
      }
    ]
  },
  {
    step: 9,
    title: "Nivel 9: Adjetivos y Adverbios N4 con Ejercicios en Contexto",
    subtitle: "Vocabulario de nivel N4 para expresarse con fluidez y matices",
    stage: "Fluidez",
    icon: "⚡",
    tab: "vocab",
    sourcePdf: "N4 vocabulary adjectives.pdf & N4 vocabulary adverbs.pdf (Unidades 1 a 6)",
    objectives: [
      "Dominar adjetivos de nivel N4 con matices psicológicos y sociales (素晴らしい, 厳しい, 熱心, 危険)",
      "Dominar los adverbios más frecuentes de los exámenes JLPT N4 (必ず, そろそろ, はっきり, 例えば)",
      "Resolver ejercicios reales de rellenar espacios en oraciones extraídas de exámenes de certificación",
      "Expresar opiniones estructuradas, grados de certeza y explicaciones de causa-consecuencia"
    ],
    detailed_guide: "El nivel N4 requiere trascender las descripciones elementales para comunicar matices psicológicos, juicios de valor y relaciones de tiempo precisas. Adverbios como そろそろ (ya es momento de...), 必ず (sin falta) y はっきり (con claridad) permiten hablar con la naturalidad de un hablante nativo.",
    grammar_focus: [
      "Adverbios modales y de tiempo N4 (そろそろ, どんどん, 必ず, 例えば)",
      "Adjetivos emocionales y de actitud (さびしい, 厳しい, 熱心, 危険, 安全)",
      "Conexión de causa con 〜から / 〜ので (como... por eso...)",
      "Uso de 〜し、〜し para listar múltiples razones o características"
    ],
    included_vocab: [
      "すばらしい", "あぶない", "あんぜん", "こわい", "さびしい", 
      "きびしい", "ねっしん", "かならず", "そろそろ", "はっきり", "例えば", "どんどん"
    ],
    vocab_details: [
      { kanji: "素晴らしい", kana: "すばらしい", romaji: "subarashii", meaning: "Maravilloso / Espléndido", type: "Adjetivo-い" },
      { kanji: "厳しい", kana: "きびしい", romaji: "kibishii", meaning: "Estricto / Riguroso", type: "Adjetivo-い" },
      { kanji: "熱心", kana: "ねっしん", romaji: "nesshin", meaning: "Entusiasta / Apasionado", type: "Adjetivo-な" },
      { kanji: "安全", kana: "あんぜん", romaji: "anzen", meaning: "Seguro / Sin peligro", type: "Adjetivo-な" },
      { kanji: "危険", kana: "きけん", romaji: "kiken", meaning: "Peligroso / En riesgo", type: "Adjetivo-な" },
      { kanji: "寂しい", kana: "さびしい", romaji: "sabishii", meaning: "Solitario / Con nostalgia", type: "Adjetivo-い" },
      { kanji: "必ず", kana: "かならず", romaji: "kanarazu", meaning: "Sin falta / Ciertamente", type: "Adverbio" },
      { kanji: "そろそろ", kana: "そろそろ", romaji: "sorosoro", meaning: "Ya va siendo hora de / Poco a poco", type: "Adverbio" }
    ],
    examples: [
      {
        jp: "山から見る景色はとても素晴らしいです。",
        kana: "やまからみるけしきはとてもすばらしいです。",
        romaji: "Yama kara miru keshiki wa totemo subarashii desu.",
        es: "La vista que se contempla desde la montaña es maravillosa.",
        explanation: "Ejercicio directo del PDF de N4 para calificar paisajes naturales extraordinarios."
      },
      {
        jp: "あの湖は深いから危険ですが、この湖は浅いから安全です。",
        kana: "あのみずうみはふかいからきけんですが、このみずうみはあさいからあんぜんです。",
        romaji: "Ano mizuumi wa fukai kara kiken desu ga, kono mizuumi wa asai kara anzen desu.",
        es: "Aquel lago es profundo por lo que es peligroso, pero este lago es poco profundo así que es seguro.",
        explanation: "Contraste de causa-efecto entre 危険 (peligroso) y 安全 (seguro)."
      },
      {
        jp: "もう十時ですね。そろそろ失礼します。",
        kana: "もうじゅうじですね。そろそろしつれいします。",
        romaji: "Mou juu-ji desu ne. Sorosoro shitsurei shimasu.",
        es: "Ya son las diez. Ya va siendo hora de que me retire.",
        explanation: "Uso imprescindible de そろそろ para despedirse con delicadeza en sociedad japonesa."
      }
    ],
    exercises: [
      {
        id: "cur_9_1",
        question: "Completa la oración: 'Nick vivió en Japón, así que habla bien (hábilmente) japonés.'",
        sentence: "ニックさんは日本に住んでいたから、日本語が (　) です。",
        options: ["じょうず", "きびしい", "うるさい", "にがい"],
        correct: "じょうず",
        explanation: "じょうず (上手) describe habilidad o dominio en una disciplina o lengua."
      },
      {
        id: "cur_9_2",
        question: "¿Qué adverbio significa 'sin falta' en una promesa?",
        sentence: "明日、(　) 電話します。",
        options: ["かならず", "そろそろ", "あまり", "ぜんぜん"],
        correct: "かならず",
        explanation: "かならず (必ず) expresa compromiso certero e ineludible."
      },
      {
        id: "cur_9_3",
        question: "¿Qué adjetivo describe al profesor que es apasionado con su enseñanza?",
        sentence: "先生はとても (　) に教えてくれます。",
        options: ["熱心 (ねっしん)", "危ない (あぶない)", "寂しい (さびしい)", "苦い (にがい)"],
        correct: "熱心 (ねっしん)",
        explanation: "熱心 (nesshin) significa entusiasta, dedicado o apasionado."
      }
    ]
  }
];

fs.writeFileSync(path.join(__dirname, '../data/curriculum.json'), JSON.stringify(curriculum, null, 2), 'utf-8');
console.log('Saved enhanced curriculum.json with 9 complete, deeply enriched modules!');
