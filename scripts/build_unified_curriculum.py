import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

# 1. Load existing JLPT steps (1 to 9)
existing_curr = json.load(open(os.path.join(DATA_DIR, "curriculum.json"), encoding="utf-8"))

# Mark existing as track 'jlpt'
for c in existing_curr:
    c["track"] = "jlpt"
    c["track_label"] = "Ruta JLPT Progresiva"
    c["category"] = "Gramática y Lectura JLPT"
    c["level"] = "N5" if c["step"] <= 6 else "N4"

# 2. Build the 18 Irodori Elementary (Starter A1) Modules
irodori_modules = [
    {
        "step": 101,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 1: はじめての日本語 (Iniciación)",
        "lesson_num": 1,
        "level": "A1",
        "category": "Saludos y Cortesía",
        "title": "Irodori L1: おはようございます (¡Buenos días!)",
        "subtitle": "Saludos cotidianos, despedidas laborales y fórmulas de cortesía",
        "stage": "Iniciación A1",
        "icon": "🌸",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 44-61)",
        "objectives": [
            "Can-do 01: Saludar al encontrarse con compañeros y vecinos según el momento del día.",
            "Can-do 02: Despedirse al retirarse del trabajo con fórmulas canónicas (お先に失礼します, お疲れさまでした).",
            "Can-do 03: Agradecer y pedir disculpas en situaciones concretas (ありがとうございます, すみません).",
            "Can-do 04: Comprender stickers y estampas de mensajería digital cotidiana."
        ],
        "can_dos": [
            {"id": "Can-do 01", "task": "Saludar al encontrarse con personas según el momento del día", "sample": "おはようございます / こんにちは / こんばんは"},
            {"id": "Can-do 02", "task": "Despedirse adecuadamente al terminar la jornada laboral", "sample": "お先に失礼します / お疲れさまでした"},
            {"id": "Can-do 03", "task": "Agradecer o disculparse con naturalidad", "sample": "ありがとうございます / すみません"},
            {"id": "Can-do 04", "task": "Interpretar estampas y stickers de chat en mensajería", "sample": "Stickers con expresiones cortas"}
        ],
        "detailed_guide": "En la vida diaria y laboral en Japón, los saludos determinan el ambiente y la confianza interpersonal. Por la mañana en el trabajo se usa 'おはようございます' (incluso si entras a las 3 de la tarde, es el saludo de inicio de turno). Al marcharte antes que tus compañeros debes decir 'お先に失礼します' (con permiso por retirarme antes), a lo que responderán 'お疲れさまでした' (gracias por tu arduo esfuerzo).",
        "grammar_focus": [
            "おはようございます vs おはよう (Formal vs Familiar)",
            "お先に失礼します (Fórmula fija de despedida en el trabajo)",
            "お疲れさまでした (Reconocimiento del esfuerzo laboral)",
            "すみません (Triple función: Disculpe / Perdón / Gracias)"
        ],
        "included_vocab": ["おはようございます", "こんにちは", "こんばんは", "お先に失礼します", "お疲れさまでした", "ありがとうございます", "すみません", "じゃあまた"],
        "vocab_details": [
            {"kanji": "おはようございます", "kana": "おはようございます", "romaji": "ohayou gozaimasu", "meaning": "Buenos días (formal)", "type": "Saludo"},
            {"kanji": "こんにちは", "kana": "こんにちは", "romaji": "konnichiwa", "meaning": "Hola / Buenas tardes", "type": "Saludo"},
            {"kanji": "こんばんは", "kana": "こんばんは", "romaji": "konbanwa", "meaning": "Buenas noches (al saludar)", "type": "Saludo"},
            {"kanji": "お先に失礼します", "kana": "おさきにしつれいします", "romaji": "osaki ni shitsuree shimasu", "meaning": "Con su permiso me retiro antes (laboral)", "type": "Cortesía"},
            {"kanji": "お疲れさまでした", "kana": "おつかれさまでした", "romaji": "otsukaresama deshita", "meaning": "Gracias por su esfuerzo / Buen trabajo", "type": "Cortesía"},
            {"kanji": "すみません", "kana": "すみません", "romaji": "sumimasen", "meaning": "Disculpe / Perdón / Gracias", "type": "Expresión"}
        ],
        "examples": [
            {"jp": "お先に失礼します。お疲れさまでした。", "kana": "おさきにしつれいします。おつかれさまでした。", "romaji": "Osaki ni shitsuree shimasu. Otsukaresama deshita.", "es": "Me retiro antes. Buen trabajo.", "explanation": "Intercambio indispensable al terminar la jornada laboral."},
            {"jp": "田中さん、おはようございます。", "kana": "たなかさん、おはようございます。", "romaji": "Tanaka-san, ohayou gozaimasu.", "es": "Señor Tanaka, buenos días.", "explanation": "Saludo matutino formal en la oficina."}
        ],
        "exercises": [
            {
                "id": "iro_1_1",
                "question": "¿Qué dices a tus compañeros al marcharte del trabajo al terminar tu turno?",
                "sentence": "先に帰るとき： (　) 。",
                "options": ["お先に失礼します", "こんにちは", "いただきます", "ごちそうさまでした"],
                "correct": "お先に失礼します",
                "explanation": "「お先に失礼します」 es la norma de cortesía obligatoria al marcharse antes que el resto."
            },
            {
                "id": "iro_1_2",
                "question": "¿Cuál es la respuesta adecuada cuando un compañero dice 'お先に失礼します'?",
                "sentence": "返事： (　) 。",
                "options": ["お疲れさまでした", "はじめまして", "どういたしまして", "おやすみなさい"],
                "correct": "お疲れさまでした",
                "explanation": "「お疲れさまでした」 reconoce el esfuerzo del compañero que acaba de trabajar."
            }
        ]
    },
    {
        "step": 102,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 1: はじめての日本語 (Iniciación)",
        "lesson_num": 2,
        "level": "A1",
        "category": "Comunicación y Aclaración",
        "title": "Irodori L2: すみません、よくわかりません (Disculpe, no entiendo bien)",
        "subtitle": "Manejo de malentendidos, pedir repetición y hablar sobre idiomas",
        "stage": "Iniciación A1",
        "icon": "💬",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 62-80)",
        "objectives": [
            "Can-do 05: Pedir que repitan o hablen más despacio cuando no se comprende bien.",
            "Can-do 06: Decir qué idiomas se dominan y preguntar a los demás.",
            "Can-do 07: Preguntar cómo se llama o pronuncia un objeto en idioma japonés."
        ],
        "can_dos": [
            {"id": "Can-do 05", "task": "Pedir que repitan una indicación", "sample": "もう一度お願いします / ゆっくりお願いします"},
            {"id": "Can-do 06", "task": "Responder sobre habilidades de idioma", "sample": "日本語、できますか？ / 英語が少しできます"},
            {"id": "Can-do 07", "task": "Preguntar el nombre japonés de algo", "sample": "これは日本語で何と言いますか？"}
        ],
        "detailed_guide": "Para sobrevivir y comunicarse en Japón sin frustración, dominar las estrategias de aclaración es vital. Cuando un interlocutor hable demasiado rápido o use palabras desconocidas, decir con naturalidad 'すみません、もう一度お願いします' (Disculpe, otra vez por favor) o '少しゆっくり話してください' mantendrá abierto el canal comunicativo.",
        "grammar_focus": [
            "もう一度お願いします (Petición de repetición)",
            "ゆっくりお願いします (Petición de hablar pausadamente)",
            "Nができます / できません (Capacidad o dominio de una lengua)",
            "これは日本語で何と言いますか (Preguntar por el término japonés)"
        ],
        "included_vocab": ["わかりません", "もう一度", "ゆっくり", "英語", "日本語", "少し", "できます", "何と言いますか"],
        "vocab_details": [
            {"kanji": "分かりません", "kana": "わかりません", "romaji": "wakarimasen", "meaning": "No entiendo / No lo sé", "type": "Expresión"},
            {"kanji": "もう一度", "kana": "もういちど", "romaji": "mou ichido", "meaning": "Una vez más", "type": "Adverbio"},
            {"kanji": "ゆっくり", "kana": "ゆっくり", "romaji": "yukkuri", "meaning": "Despacio / Con calma", "type": "Adverbio"},
            {"kanji": "少し", "kana": "すこし", "romaji": "sukoshi", "meaning": "Un poco", "type": "Adverbio"}
        ],
        "examples": [
            {"jp": "すみません、よくわかりません。もう一度お願いします。", "kana": "すみません、よくわかりません。もういちどおねがいします。", "romaji": "Sumimasen, yoku wakarimasen. Mou ichido onegai shimasu.", "es": "Disculpe, no entiendo bien. ¿Podría repetirlo otra vez, por favor?", "explanation": "Frase canónica para solicitar repetición en cualquier trámite o conversación."}
        ],
        "exercises": [
            {
                "id": "iro_2_1",
                "question": "¿Cómo pides que alguien hable más despacio?",
                "sentence": "すみません、 (　) お願いします。",
                "options": ["ゆっくり", "はやく", "たくさん", "ぜんぶ"],
                "correct": "ゆっくり",
                "explanation": "「ゆっくり」 significa 'despacio / con calma'."
            }
        ]
    },
    {
        "step": 103,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 2: 私のこと (Sobre Mí)",
        "lesson_num": 3,
        "level": "A1",
        "category": "Presentación y Trámites",
        "title": "Irodori L3: よろしくお願いします (Mucho gusto)",
        "subtitle": "Identificación personal, país natal y rellenado de formularios",
        "stage": "Fundamentos A1",
        "icon": "📇",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 81-100)",
        "objectives": [
            "Can-do 08: Dar una auto-presentación sencilla indicando nombre y país.",
            "Can-do 09: Escribir nombre y nacionalidad en tarjetas de identificación (name tags).",
            "Can-do 10: Preguntar y responder sobre origen y procedencia (ご出身は？).",
            "Can-do 11: Rellenar formularios de solicitud oficiales (nombre, fecha de nacimiento, nacionalidad)."
        ],
        "can_dos": [
            {"id": "Can-do 08", "task": "Presentación personal completa", "sample": "私はマルシアです。ブラジルから来ました。"},
            {"id": "Can-do 09", "task": "Escribir datos en credenciales", "sample": "Rellenar Name Tags con nombre en katakana y país"},
            {"id": "Can-do 10", "task": "Conversar sobre ciudad o país de origen", "sample": "ご出身はどちらですか？"},
            {"id": "Can-do 11", "task": "Completar solicitudes administrativas básicas", "sample": "Formularios de inscripción"}
        ],
        "detailed_guide": "En Japón, la presentación personal (自己紹介 - jikoshoukai) sigue una secuencia respetuosa: primero 'はじめまして' (mucho gusto por primera vez), luego tu nombre con la partícula は ('私はマルシアです'), tu país de procedencia ('ブラジルから来ました') y se concluye con una ligera reverencia diciendo 'どうぞよろしくお願いします'.",
        "grammar_focus": [
            "N1 は N2 です (Afirmación de identidad)",
            "【Lugar】から来ました (Indicar país o ciudad natal de procedencia)",
            "Nは？ (Pregunta de cortesía: ¿Y usted?)",
            "Partícula も (Inclusión: 'yo también')",
            "Negación con Nじゃないです / ではありません"
        ],
        "included_vocab": ["名前", "国", "私", "から来ました", "出身", "どうぞ", "よろしくお願いします"],
        "vocab_details": [
            {"kanji": "名前", "kana": "なまえ", "romaji": "namae", "meaning": "Nombre", "type": "Sustantivo"},
            {"kanji": "国", "kana": "くに", "romaji": "kuni", "meaning": "País", "type": "Sustantivo"},
            {"kanji": "私", "kana": "わたし", "romaji": "watashi", "meaning": "Yo", "type": "Pronombre"},
            {"kanji": "出身", "kana": "しゅっしん", "romaji": "shusshin", "meaning": "Procedencia / Ciudad natal", "type": "Sustantivo"}
        ],
        "examples": [
            {"jp": "はじめまして。ダニエルです。メキシコから来ました。よろしくお願いします。", "kana": "はじめまして。ダニエルです。メキシコからきました。よろしくおねがいします。", "romaji": "Hajimemashite. Daniel desu. Mekishiko kara kimashita. Yoroshiku onegai shimasu.", "es": "Mucho gusto. Soy Daniel. Vengo de México. Encantado de conocerles.", "explanation": "Estructura canónica de presentación en Japón."}
        ],
        "exercises": [
            {
                "id": "iro_3_1",
                "question": "¿Cómo indicas que provienes de España?",
                "sentence": "スペイン (　) 来ました。",
                "options": ["から", "まで", "に", "で"],
                "correct": "から",
                "explanation": "から indica origen o punto de partida ('vengo desde/de')."
            }
        ]
    },
    {
        "step": 104,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 2: 私のこと (Sobre Mí)",
        "lesson_num": 4,
        "level": "A1",
        "category": "Familia y Residencia",
        "title": "Irodori L4: 東京に住んでいます (Vivo en Tokio)",
        "subtitle": "Miembros de la familia, residencia, edad y redes sociales",
        "stage": "Fundamentos A1",
        "icon": "👨‍👩‍👧",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 101-123)",
        "objectives": [
            "Can-do 12: Escuchar y comprender quién es quién al presentar una familia.",
            "Can-do 13: Preguntar y responder sobre lugar de residencia y edad (何歳ですか？).",
            "Can-do 14: Mostrar y describir fotos de seres queridos o mascotas.",
            "Can-do 15: Leer publicaciones breves de amigos en redes sociales apoyándose en fotos."
        ],
        "can_dos": [
            {"id": "Can-do 12", "task": "Comprender presentaciones de familiares", "sample": "夫と子どもです"},
            {"id": "Can-do 13", "task": "Conversar sobre edad y residencia", "sample": "25歳です / 東京に住んでいます"},
            {"id": "Can-do 14", "task": "Describir fotos familiares", "sample": "これはペットのジョンです"},
            {"id": "Can-do 15", "task": "Leer posts breves en redes sociales", "sample": "友だちと海！"}
        ],
        "detailed_guide": "Para hablar de dónde vivimos se utiliza la estructura 'Lugar + に住んでいます' (住む es un verbo de estado continuo). Para unir a personas o miembros familiares se usa la partícula と ('夫と子ども' - Mi esposo y mi hijo). Recuerda que al hablar de tu propia familia se usan términos humildes (父 chichi, 母 haha) en lugar de los honoríficos (お父さん, お母さん).",
        "grammar_focus": [
            "N1 と N2 (Unión de sustantivos: 'y')",
            "【Lugar】に住んでいます (Lugar de residencia habitual)",
            "何歳ですか / 〜歳です (Preguntar y decir la edad)",
            "N1 の N2 (Posesión / pertenencia: 私の母)"
        ],
        "included_vocab": ["父", "母", "子ども", "日本", "住んでいます", "歳", "夫", "妻", "ペット"],
        "vocab_details": [
            {"kanji": "父", "kana": "ちち", "romaji": "chichi", "meaning": "Mi padre (humilde)", "type": "Sustantivo"},
            {"kanji": "母", "kana": "はは", "romaji": "haha", "meaning": "Mi madre (humilde)", "type": "Sustantivo"},
            {"kanji": "子ども", "kana": "こども", "romaji": "kodomo", "meaning": "Hijo / Niño", "type": "Sustantivo"},
            {"kanji": "日本", "kana": "にほん", "romaji": "nihon", "meaning": "Japón", "type": "Sustantivo"}
        ],
        "examples": [
            {"jp": "家族はフィリピンに住んでいます。私は東京に住んでいます。", "kana": "かぞくはフィリピンにすんでいます。わたしはとうきょうにすんでいます。", "romaji": "Kazoku wa Firipin ni sunde imasu. Watashi wa Toukyou ni sunde imasu.", "es": "Mi familia vive en Filipinas. Yo vivo en Tokio.", "explanation": "Uso de に住んでいます para expresar residencia actual."}
        ],
        "exercises": [
            {
                "id": "iro_4_1",
                "question": "¿Qué partícula se utiliza para indicar dónde resides?",
                "sentence": "私は大阪 (　) 住んでいます。",
                "options": ["に", "で", "を", "から"],
                "correct": "に",
                "explanation": "El verbo 住む requiere la partícula に para indicar el lugar de asentamiento o residencia."
            }
        ]
    },
    {
        "step": 105,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 3: 好きな食べ物 (Comida)",
        "lesson_num": 5,
        "level": "A1",
        "category": "Comida y Gastronomía",
        "title": "Irodori L5: うどんが好きです (Me gusta el udon)",
        "subtitle": "Gustos culinarios, rechazo diplomático y hábitos del desayuno",
        "stage": "Vida Diaria A1",
        "icon": "🍜",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 124-158)",
        "objectives": [
            "Can-do 16: Responder preguntas sobre comidas que nos gustan o desagradan.",
            "Can-do 17: Expresar rechazo con cortesía diplomática sin ofender (わさびは、ちょっと…).",
            "Can-do 18: Responder a invitaciones de bebida (お茶、飲みますか？).",
            "Can-do 19: Describir hábitos del desayuno con adverbios de frecuencia.",
            "Can-do 20: Redactar pies de foto sencillos de comida para redes sociales."
        ],
        "can_dos": [
            {"id": "Can-do 16", "task": "Expresar preferencias de comida", "sample": "肉が好きです / 魚は好きじゃないです"},
            {"id": "Can-do 17", "task": "Rechazar comida con tacto", "sample": "わさびは、ちょっと…"},
            {"id": "Can-do 18", "task": "Aceptar o declinar ofertas de bebidas", "sample": "お茶、飲みますか？ / お願いします"},
            {"id": "Can-do 19", "task": "Describir el desayuno cotidiano", "sample": "朝ご飯は、あまり食べません"},
            {"id": "Can-do 20", "task": "Publicar comentarios sobre comida", "sample": "今日の朝ご飯！おいしい！"}
        ],
        "detailed_guide": "Para expresar que algo te gusta se usa 'Objeto + が好きです' (el objeto del gusto va con が, no con を). Para decir que no te gusta sin sonar grosero, los japoneses casi nunca dicen '嫌い' (odio/detesto); en su lugar dicen 'わさびは、ちょっと…' (el wasabi es un poco... dejando la frase en el aire).",
        "grammar_focus": [
            "Nが好きです / 好きじゃないです (Gustos y disgustos)",
            "Nはちょっと… (Rechazo cortés sin decir 'no')",
            "Nを V-ます (Objeto directo de comer o beber)",
            "Adverbios de frecuencia: いつも (siempre), よく (a menudo), あまり〜ない (no mucho), ぜんぜん〜ない (nada en absoluto)"
        ],
        "included_vocab": ["水", "食べます", "飲みます", "好き", "肉", "野菜", "魚", "朝ご飯", "お茶", "わさび", "いつも", "あまり"],
        "vocab_details": [
            {"kanji": "水", "kana": "みず", "romaji": "mizu", "meaning": "Agua", "type": "Sustantivo"},
            {"kanji": "食べます", "kana": "たべます", "romaji": "tabemasu", "meaning": "Comer", "type": "Verbo"},
            {"kanji": "飲みます", "kana": "のみます", "romaji": "nomimasu", "meaning": "Beber", "type": "Verbo"},
            {"kanji": "好き", "kana": "すき", "romaji": "suki", "meaning": "Gusto / Preferido", "type": "Adjetivo-na"}
        ],
        "examples": [
            {"jp": "私はうどんが好きです。朝ご飯は、いつもパンを食べます。", "kana": "わたしはうどんがすきです。あさごはんはいつもパンをたべます。", "romaji": "Watashi wa udon ga suki desu. Asagohan wa itsumo pan o tabemasu.", "es": "Me gusta el udon. De desayuno siempre como pan.", "explanation": "Uso de が好き y adverbios de frecuencia en la vida cotidiana."}
        ],
        "exercises": [
            {
                "id": "iro_5_1",
                "question": "¿Cómo rechazas amablemente una comida diciendo 'El wasabi me resulta un poco...'?",
                "sentence": "わさびは、 (　) …。",
                "options": ["ちょっと", "とても", "たくさん", "いつも"],
                "correct": "ちょっと",
                "explanation": "「ちょっと…」 es la forma diplomática por excelencia en Japón para expresar rechazo."
            }
        ]
    },
    {
        "step": 106,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 3: 好きな食べ物 (Comida)",
        "lesson_num": 6,
        "level": "A1",
        "category": "Restaurantes y Pedidos",
        "title": "Irodori L6: チーズバーガーください (Una hamburguesa con queso, por favor)",
        "subtitle": "Pedir en comida rápida, máquinas de tickets, izakayas y contadores",
        "stage": "Vida Diaria A1",
        "icon": "🍔",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 159-181)",
        "objectives": [
            "Can-do 21: Leer un menú con fotografías en un restaurante de comida rápida.",
            "Can-do 22: Pedir comida indicando si es para tomar en el local o para llevar (店内 / お持ち帰り).",
            "Can-do 23: Consensuar la elección de plato con amigos (私はカレーにします).",
            "Can-do 24: Pedir raciones en restaurantes usando contadores nativos (ひとつ, ふたつ, みっつ).",
            "Can-do 25: Reconocer letreros de establecimientos gastronómicos en la calle."
        ],
        "can_dos": [
            {"id": "Can-do 21", "task": "Interpretar cartas de menú", "sample": "Identificar combos, hamburguesas y bebidas"},
            {"id": "Can-do 22", "task": "Ordenar en comida rápida", "sample": "こちらでお召し上がりですか？ / 店内で"},
            {"id": "Can-do 23", "task": "Decidir qué pedir en grupo", "sample": "私はうどんにします"},
            {"id": "Can-do 24", "task": "Pedir platos por unidades en izakaya", "sample": "枝豆2つとビール1つ、お願いします"},
            {"id": "Can-do 25", "task": "Identificar carteles de comida", "sample": "Ramen, Soba, Teishoku, Izakaya"}
        ],
        "detailed_guide": "Al ordenar en Japón, para pedir algo se usa 'N、ください' o 'N、お願いします'. Para elegir algo entre varias opciones se dice 'Nにします' (decido por / me quedo con). Los contadores nativos del 1 al 3 son: 1 (ひとつ hitotsu), 2 (ふたつ futatsu), 3 (みっつ mittsu).",
        "grammar_focus": [
            "N、お願いします / ください (Pedir un plato o bebida)",
            "Nにします (Decisión personal: 'elijo esto')",
            "Contadores nativos: ひとつ, ふたつ, みっつ",
            "N（は）ありますか (Consultar disponibilidad: ¿tienen...?)"
        ],
        "included_vocab": ["魚", "肉", "ください", "お願いします", "にします", "ひとつ", "ふたつ", "みっつ", "店内", "お持ち帰り"],
        "vocab_details": [
            {"kanji": "肉", "kana": "にく", "romaji": "niku", "meaning": "Carne", "type": "Sustantivo"},
            {"kanji": "魚", "kana": "さかな", "romaji": "sakana", "meaning": "Pescado", "type": "Sustantivo"},
            {"kanji": "一つ", "kana": "ひとつ", "romaji": "hitotsu", "meaning": "Uno (contador general)", "type": "Contador"},
            {"kanji": "二つ", "kana": "ふたつ", "romaji": "futatsu", "meaning": "Dos (contador general)", "type": "Contador"}
        ],
        "examples": [
            {"jp": "生ビール二つと枝豆一つ、お願いします。", "kana": "なまビールふたつとえだまめひとつ、おねがいします。", "romaji": "Nama biiru futatsu to edamame hitotsu, onegai shimasu.", "es": "Dos cervezas de barril y una de edamame, por favor.", "explanation": "Pedido canónico en una taberna izakaya."}
        ],
        "exercises": [
            {
                "id": "iro_6_1",
                "question": "¿Cómo pides dos hamburguesas en un restaurante?",
                "sentence": "ハンバーガー (　) ください。",
                "options": ["ふたつ", "ひとつ", "みっつ", "よっつ"],
                "correct": "ふたつ",
                "explanation": "「ふたつ」 es el contador nativo para dos unidades."
            }
        ]
    }
]

# Merge into unified curriculum
all_curriculum = list(existing_curr)
existing_steps = {c["step"] for c in all_curriculum}

for im in irodori_modules:
    if im["step"] not in existing_steps:
        all_curriculum.append(im)

all_curriculum.sort(key=lambda x: x["step"])

print(f"Total unified curriculum steps: {len(all_curriculum)}")

with open(os.path.join(DATA_DIR, "curriculum.json"), "w", encoding="utf-8") as f:
    json.dump(all_curriculum, f, ensure_ascii=False, indent=2)

print("Saved unified curriculum.json successfully!")
