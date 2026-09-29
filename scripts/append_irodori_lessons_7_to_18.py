import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
curr_path = os.path.join(DATA_DIR, "curriculum.json")

all_curr = json.load(open(curr_path, encoding="utf-8"))
existing_steps = {c["step"]: c for c in all_curr}

extra_lessons = [
    {
        "step": 107,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 4: 家と職場 (Hogar y Trabajo)",
        "lesson_num": 7,
        "level": "A1",
        "category": "Vivienda y Electrodomésticos",
        "title": "Irodori L7: 部屋が4つあります (Hay 4 habitaciones)",
        "subtitle": "Planos de casas, dimensiones, servicios y botones de electrodomésticos",
        "stage": "Entorno A1",
        "icon": "🏠",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 182-214)",
        "objectives": [
            "Can-do 26: Comprender la distribución de un plano de vivienda en Japón.",
            "Can-do 27: Preguntar y verificar si un piso cuenta con electrodomésticos y servicios.",
            "Can-do 28: Describir dimensiones y características de una casa (静かです, せまいです).",
            "Can-do 29: Conversar sobre el tipo de vivienda en el que se habita.",
            "Can-do 30: Leer los botones de electrodomésticos (aire acondicionado: 冷房, 暖房, 停止; lavadora)."
        ],
        "can_dos": [
            {"id": "Can-do 26", "task": "Comprender la distribución de un plano de casa", "sample": "ここは玄関です / 1階に部屋が4つあります"},
            {"id": "Can-do 27", "task": "Consultar electrodomésticos en la vivienda", "sample": "電子レンジはありますか？ / ベッドはないです"},
            {"id": "Can-do 28", "task": "Describir el hogar", "sample": "アパートは静かです。ちょっとせまいです。"},
            {"id": "Can-do 29", "task": "Hablar sobre el tipo de casa", "sample": "寮に住んでいます"},
            {"id": "Can-do 30", "task": "Leer botones de aparatos eléctricos", "sample": "冷房 (aire frío), 暖房 (calefacción), 停止 (parar)"}
        ],
        "detailed_guide": "Las viviendas japonesas tienen elementos arquitectónicos únicos como el genkan (donde se quitan los zapatos) y controles remotos multifuncionales para el aire acondicionado. Los kanjis esenciales son 冷房 (reibou - refrigeración), 暖房 (danbou - calefacción), 風量 (fuuryou - caudal de aire) y 停止 (teishi - parada).",
        "grammar_focus": [
            "ここは【Lugar】です (Identificar estancias: Aquí está la cocina)",
            "【Lugar】に Nがあります / Nが【número】あります (Existencia en espacio)",
            "Nはありません / ないです (Ausencia)",
            "Adjetivos-い y な afirmativos y negativos (静かじゃないです / 広くないです)"
        ],
        "included_vocab": ["家", "新しい", "広い", "古い", "部屋", "台所", "玄関", "階段", "冷房", "暖房", "静か"],
        "vocab_details": [
            {"kanji": "家", "kana": "いえ", "romaji": "ie", "meaning": "Casa", "type": "Sustantivo"},
            {"kanji": "新しい", "kana": "あたらしい", "romaji": "atarashii", "meaning": "Nuevo", "type": "Adjetivo-i"},
            {"kanji": "広い", "kana": "ひろい", "romaji": "hiroi", "meaning": "Amplio", "type": "Adjetivo-i"},
            {"kanji": "古い", "kana": "ふるい", "romaji": "furui", "meaning": "Antiguo / Viejo", "type": "Adjetivo-i"}
        ],
        "examples": [
            {"jp": "ここは台所です。1階に部屋が4つあります。", "kana": "ここはだいどころです。いっかいにへやがよっつあります。", "romaji": "Koko wa daidokoro desu. Ikkai ni heya ga yottsu arimasu.", "es": "Aquí está la cocina. En el primer piso hay 4 habitaciones.", "explanation": "Descripción del plano de una vivienda."}
        ],
        "exercises": [
            {
                "id": "iro_7_1",
                "question": "¿Qué botón del mando del aire acondicionado presionas en verano para poner aire frío?",
                "sentence": "夏のエアコン： (　) を押します。",
                "options": ["冷房", "暖房", "停止", "送風"],
                "correct": "冷房",
                "explanation": "冷房 (reibou) es el modo refrigeración/aire frío."
            }
        ]
    },
    {
        "step": 108,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 4: 家と職場 (Hogar y Trabajo)",
        "lesson_num": 8,
        "level": "A1",
        "category": "Lugar de Trabajo",
        "title": "Irodori L8: 山田さんはどこにいますか？ (¿Dónde está Yamada?)",
        "subtitle": "Orientación en oficinas, localización de compañeros y letreros de salas",
        "stage": "Entorno A1",
        "icon": "🏢",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 215-239)",
        "objectives": [
            "Can-do 31: Comprender una visita guiada laboral sobre las dependencias de la empresa.",
            "Can-do 32: Preguntar y responder sobre el paradero de compañeros (山田さんは食堂にいます).",
            "Can-do 33: Localizar herramientas y materiales de oficina (はさみは、そこにあります).",
            "Can-do 34: Leer placas en puertas de centros laborales (事務室, 休憩室, 倉庫)."
        ],
        "can_dos": [
            {"id": "Can-do 31", "task": "Entender la distribución del centro de trabajo", "sample": "ここで打ち合わせをします"},
            {"id": "Can-do 32", "task": "Preguntar por compañeros de trabajo", "sample": "山田さんは食堂にいます"},
            {"id": "Can-do 33", "task": "Indicar ubicación de material de oficina", "sample": "引き出しの中にあります"},
            {"id": "Can-do 34", "task": "Interpretar letreros de salas", "sample": "事務室 (oficina), 会議室 (sala de reuniones), 倉庫 (almacén)"}
        ],
        "detailed_guide": "Para indicar el lugar donde se realiza una actividad de trabajo se usa 'Lugar + で + Verbo' (ここで着替えます - Aquí nos cambiamos de ropa). Para ubicar a personas se utiliza 'Persona + は + Lugar + にいます' (山田さんは会議室にいます). Posiciones relativas: 上 (encima), 下 (debajo), 中 (adentro).",
        "grammar_focus": [
            "【Lugar】で V-ます (Lugar de acción dinámica)",
            "【Persona】は【Lugar】にいます (Ubicación de personas)",
            "【Objeto】は【Lugar】にあります (Ubicación de cosas inanimadas)",
            "Nの【posicion】にあります (引き出しの中にあります - adentro del cajón)"
        ],
        "included_vocab": ["上", "下", "中", "います", "あります", "食堂", "会議室", "事務所", "引き出し", "はさみ"],
        "vocab_details": [
            {"kanji": "上", "kana": "うえ", "romaji": "ue", "meaning": "Arriba / Encima", "type": "Sustantivo"},
            {"kanji": "下", "kana": "した", "romaji": "shita", "meaning": "Abajo / Debajo", "type": "Sustantivo"},
            {"kanji": "中", "kana": "なか", "romaji": "naka", "meaning": "Dentro / En medio", "type": "Sustantivo"}
        ],
        "examples": [
            {"jp": "山田さんは今、会議室にいます。はさみは引き出しの中にあります。", "kana": "やまださんはいま、かいぎしつにいます。はさみはひきだしのなかにあります。", "romaji": "Yamada-san wa ima, kaigishitsu ni imasu. Hasami wa hikidashi no naka ni arimasu.", "es": "El señor Yamada está ahora en la sala de reuniones. Las tijeras están dentro del cajón.", "explanation": "Distinción entre にいます (personas) y にあります (objetos)."}
        ],
        "exercises": [
            {
                "id": "iro_8_1",
                "question": "¿Qué partícula indica la ubicación de una persona viva con el verbo います?",
                "sentence": "田中さんは食堂 (　) います。",
                "options": ["に", "で", "を", "へ"],
                "correct": "に",
                "explanation": "La existencia o presencia de seres vivos se marca con にいます."
            }
        ]
    },
    {
        "step": 109,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 5: 毎日の生活 (Vida Diaria)",
        "lesson_num": 9,
        "level": "A1",
        "category": "Horarios y Rutinas",
        "title": "Irodori L9: 12時から1時まで昼休みです (El descanso es de 12 a 1)",
        "subtitle": "Rutinas horarias, agendas laborales y días de la semana",
        "stage": "Vida Diaria A1",
        "icon": "⏰",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 240-259)",
        "objectives": [
            "Can-do 35: Preguntar y responder a qué hora nos levantamos o dormimos.",
            "Can-do 36: Comprender la explicación de los horarios laborales de una jornada.",
            "Can-do 37: Leer pizarras de turnos y agendas compartidas (schedule board).",
            "Can-do 38: Acordar días y horas convenientes para planes (私は日曜日がいいです)."
        ],
        "can_dos": [
            {"id": "Can-do 35", "task": "Conversar sobre horarios de sueño y descanso", "sample": "何時に起きますか？ / 6時に起きます"},
            {"id": "Can-do 36", "task": "Comprender la jornada de trabajo", "sample": "12時から1時まで昼休みです"},
            {"id": "Can-do 37", "task": "Interpretar paneles de turnos laborales", "sample": "Pizarras con turnos de mañana y tarde"},
            {"id": "Can-do 38", "task": "Acordar fechas de reunión", "sample": "私は土曜日がいいです"}
        ],
        "detailed_guide": "Para marcar un punto exacto en el tiempo se utiliza 'Hora + に' (7時に起きます). Para indicar intervalos temporales se emplean から (desde) y まで (hasta). Para proponer un momento que nos convenga se dice 'Fecha/Hora + がいいです' (私は日曜日がいいです). Los 7 kanjis de los días de la semana provienen de los astros y elementos naturales.",
        "grammar_focus": [
            "【Hora】に V-ます / 【Hora】ごろ V-ます (Punto exacto o aproximado)",
            "【Hora A】から【Hora B】まで (Intervalos de tiempo)",
            "【Fecha/Hora】がいいです (Conveniencia o preferencia horaria)",
            "Días de la semana en kanji: 月, 火, 水, 木, 金, 土, 日"
        ],
        "included_vocab": ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日", "何時", "から", "まで", "昼休み", "起きます", "寝ます"],
        "vocab_details": [
            {"kanji": "月曜日", "kana": "げつようび", "romaji": "getsuyoubi", "meaning": "Lunes", "type": "Fecha"},
            {"kanji": "金曜日", "kana": "きんようび", "romaji": "kinyoubi", "meaning": "Viernes", "type": "Fecha"},
            {"kanji": "日曜日", "kana": "にちようび", "romaji": "nichiyoubi", "meaning": "Domingo", "type": "Fecha"},
            {"kanji": "昼休み", "kana": "ひるやすみ", "romaji": "hiruyasumi", "meaning": "Descanso de mediodía", "type": "Sustantivo"}
        ],
        "examples": [
            {"jp": "毎朝6時に起きます。昼休みは12時から1時までです。", "kana": "まいあさろくじにおきます。ひるやすみはじゅうにじからいちじまでです。", "romaji": "Maiasa rokuji ni okimasu. Hiruyasumi wa juuniji kara ichiji made desu.", "es": "Cada mañana me levanto a las 6. El descanso de almuerzo es de 12 a 1.", "explanation": "Uso de に para hora exacta y から〜まで para intervalos."}
        ],
        "exercises": [
            {
                "id": "iro_9_1",
                "question": "¿Cómo dices que tu turno de trabajo es 'desde las 9 hasta las 5'?",
                "sentence": "仕事は9時 (　) 5時 (　) です。",
                "options": ["から / まで", "に / で", "を / と", "より / ほど"],
                "correct": "から / まで",
                "explanation": "から expresa origen temporal y まで el límite final."
            }
        ]
    },
    {
        "step": 110,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 5: 毎日の生活 (Vida Diaria)",
        "lesson_num": 10,
        "level": "A1",
        "category": "Instrucciones de Trabajo",
        "title": "Irodori L10: ホチキス貸してください (Préstame la grapadora)",
        "subtitle": "Peticiones laborales, pedir prestadas herramientas y checklists",
        "stage": "Vida Diaria A1",
        "icon": "📎",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 260-284)",
        "objectives": [
            "Can-do 39: Comprender instrucciones breves y directas en el puesto de trabajo.",
            "Can-do 40: Confirmar cantidades y pedir repetición de puntos clave (はい、30枚ですね).",
            "Can-do 41: Leer notas de encargo manuscritas dejadas por compañeros.",
            "Can-do 42: Pedir prestadas herramientas u objetos cotidianos (貸してください / ありますか？).",
            "Can-do 43: Cotejar y verificar un checklist de materiales antes de empezar."
        ],
        "can_dos": [
            {"id": "Can-do 39", "task": "Seguir instrucciones de trabajo", "sample": "ちょっと手伝ってください"},
            {"id": "Can-do 40", "task": "Confirmar cifras o instrucciones", "sample": "すみません、いくつですか？ / 30枚ですね"},
            {"id": "Can-do 41", "task": "Leer recados manuscritos de oficina", "sample": "Mensajes en post-it de compañeros"},
            {"id": "Can-do 42", "task": "Pedir prestados útiles de oficina", "sample": "ホチキス、貸してください / 借りてもいいですか？"},
            {"id": "Can-do 43", "task": "Revisar listas de cotejo (checklists)", "sample": "Comprobación de herramientas y EPIs"}
        ],
        "detailed_guide": "Para pedir una acción de ayuda de forma cortés se utiliza 'Forma-て + ください' (手伝ってください - ayúdame por favor). Para pedir prestado un objeto se dice 'N、貸してください' o más cortésmente '借りてもいいですか？'. Para confirmar lo que te acaban de ordenar, se repite la cifra terminando en 'ですね' ('30枚ですね').",
        "grammar_focus": [
            "V-てください / V-て (Petición formal o coloquial)",
            "Nですね (Confirmación de datos o cantidades recibidas)",
            "N、貸してください / 借りてもいいですか (Pedir prestado)",
            "Contadores: 〜時 (horas), 〜分 (minutos), 〜半 (media hora), 〜枚 (hojas/papel)"
        ],
        "included_vocab": ["朝", "昼", "夜", "時", "分", "半", "枚", "手伝ってください", "貸してください", "借ります", "ホチキス"],
        "vocab_details": [
            {"kanji": "朝", "kana": "あさ", "romaji": "asa", "meaning": "Mañana", "type": "Tiempo"},
            {"kanji": "昼", "kana": "ひる", "romaji": "hiru", "meaning": "Mediodía", "type": "Tiempo"},
            {"kanji": "夜", "kana": "よる", "romaji": "yoru", "meaning": "Noche", "type": "Tiempo"},
            {"kanji": "枚", "kana": "まい", "romaji": "mai", "meaning": "Contador de hojas o cosas planas", "type": "Contador"}
        ],
        "examples": [
            {"jp": "すみません、ちょっと手伝ってください。ホチキスを貸してください。", "kana": "すみません、ちょっとてつだってください。ホチキスをかしてください。", "romaji": "Sumimasen, chotto tetsudatte kudasai. Hochikisu o kashite kudasai.", "es": "Disculpe, ayúdeme un momento por favor. ¿Me presta la grapadora?", "explanation": "Instrucción y petición habitual en un entorno laboral."}
        ],
        "exercises": [
            {
                "id": "iro_10_1",
                "question": "¿Cómo pides cortésmente a un compañero que te preste un cargador de móvil?",
                "sentence": "スマホの充電器、 (　) ください。",
                "options": ["貸して", "あげて", "売って", "捨てて"],
                "correct": "貸して",
                "explanation": "「貸してください」 significa 'préstame, por favor'."
            }
        ]
    },
    {
        "step": 111,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 6: 私の好きなこと (Ocio)",
        "lesson_num": 11,
        "level": "A1",
        "category": "Aficiones y Tiempo Libre",
        "title": "Irodori L11: どんなマンガが好きですか？ (¿Qué manga te gusta?)",
        "subtitle": "Aficiones, deportes, lectura de perfiles de redes sociales y adverbios",
        "stage": "Expresión A1",
        "icon": "🎮",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 285-310)",
        "objectives": [
            "Can-do 44: Responder con soltura sobre nuestras aficiones principales.",
            "Can-do 45: Detallar preferencias culturales específicas (「ドラゴンボール」が大好きです).",
            "Can-do 46: Explicar qué solemos hacer durante los días de descanso (うちでゆっくりします).",
            "Can-do 47: Leer y comprender perfiles personales en redes sociales."
        ],
        "can_dos": [
            {"id": "Can-do 44", "task": "Preguntar y responder sobre hobbies", "sample": "趣味は何ですか？ / 読書です"},
            {"id": "Can-do 45", "task": "Describir obras o géneros favoritos", "sample": "どんなスポーツが好きですか？"},
            {"id": "Can-do 46", "task": "Describir fines de semana", "sample": "休みの日は、たいてい映画を見ます"},
            {"id": "Can-do 47", "task": "Interpretar biografías de redes sociales", "sample": "Perfiles en Twitter/Instagram"}
        ],
        "detailed_guide": "Para preguntar sobre categorías de interés se utiliza 'どんな + Sustantivo' (どんな音楽が好きですか - ¿Qué clase de música te gusta?). Para indicar frecuencia de ocio: いつも (siempre), たいてい (generalmente), よく (a menudo), ときどき (a veces) con verbo afirmativo; y あまり / ぜんぜん con verbo negativo.",
        "grammar_focus": [
            "趣味は何ですか (Preguntar por aficiones)",
            "どんな N が好きですか (Preguntar por clase o tipo)",
            "あまり ナA-じゃない / イA-くない (Grado atenuado)",
            "【Persona】と【Lugar】で V-ます (Compañía y escenario de ocio)"
        ],
        "included_vocab": ["読みます", "聞きます", "見ます", "本", "友だち", "何", "趣味", "マンガ", "スポーツ", "映画", "たいてい"],
        "vocab_details": [
            {"kanji": "読みます", "kana": "よみます", "romaji": "yomimasu", "meaning": "Leer", "type": "Verbo"},
            {"kanji": "聞きます", "kana": "ききます", "romaji": "kikimasu", "meaning": "Escuchar", "type": "Verbo"},
            {"kanji": "見ます", "kana": "みます", "romaji": "mimasu", "meaning": "Ver / Mirar", "type": "Verbo"},
            {"kanji": "友だち", "kana": "ともだち", "romaji": "tomodachi", "meaning": "Amigo", "type": "Sustantivo"}
        ],
        "examples": [
            {"jp": "休みの日は、夫と公園でテニスをします。たいてい映画を見ます。", "kana": "やすみのひは、おっととこうえんでテニスをします。たいていえいがをみます。", "romaji": "Yasumi no hi wa, otto to kouen de tenisu o shimasu. Taitee eiga o mimasu.", "es": "Los días libres juego tenis en el parque con mi esposo. Por lo general veo películas.", "explanation": "Descripción completa de actividades de descanso."}
        ],
        "exercises": [
            {
                "id": "iro_11_1",
                "question": "¿Cómo preguntas '¿Qué clase de deportes te gustan?'?",
                "sentence": "(　) スポーツが好きですか。",
                "options": ["どんな", "いくら", "だれ", "いつ"],
                "correct": "どんな",
                "explanation": "「どんな」 significa 'qué clase de / qué tipo de'."
            }
        ]
    },
    {
        "step": 112,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 6: 私の好きなこと (Ocio)",
        "lesson_num": 12,
        "level": "A1",
        "category": "Eventos e Invitaciones",
        "title": "Irodori L12: いっしょに飲みに行きませんか？ (¿Vamos a tomar algo?)",
        "subtitle": "Folleto de eventos, proponer salidas, invitaciones y festivales",
        "stage": "Expresión A1",
        "icon": "🍻",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 311-335)",
        "objectives": [
            "Can-do 48: Leer folletos informativos de eventos locales y localizar fecha, hora y lugar.",
            "Can-do 49: Conversar sobre festivales populares de la zona (夏祭りがありますね).",
            "Can-do 50: Invitar a alguien a un plan o aceptar con entusiasmo (いっしょに行きましょう).",
            "Can-do 51: Responder por mensaje escrito aceptando o declinando una invitación."
        ],
        "can_dos": [
            {"id": "Can-do 48", "task": "Comprender panfletos de festividades", "sample": "タイフェスティバル (Fechas y recinto)"},
            {"id": "Can-do 49", "task": "Preguntar por asistencia a eventos", "sample": "明日の忘年会に行きますか？"},
            {"id": "Can-do 50", "task": "Invitar y acordar planes conjuntamente", "sample": "いっしょに行きませんか？ / 行きましょう！"},
            {"id": "Can-do 51", "task": "Escribir respuestas de mensajería", "sample": "ぜひ行きたいです！ / すみません、その日はちょっと…"}
        ],
        "detailed_guide": "Para invitar cortésmente a alguien se usa 'Verbo en forma -masen + ka' ('いっしょに焼肉を食べに行きませんか' - ¿No te gustaría ir a comer yakiniku juntos?). Para aceptar con entusiasmo se responde 'いいですね、行きましょう' (¡Me parece genial, vamos!). El propósito del movimiento se expresa con 'Raíz verbal + に行きます' (飲みに行きます - ir a beber).",
        "grammar_focus": [
            "【Fecha】に【Lugar】で【Evento】があります (Acontecimiento de eventos)",
            "V-ませんか (Invitación cortés: ¿no te gustaría...?)",
            "V-ましょう (Aceptación o propuesta entusiasta: ¡vamos a...!)",
            "V-に行きます (Verbo de movimiento con propósito: 食べに行きます)"
        ],
        "included_vocab": ["年", "月", "日", "今日", "今週", "今度", "行きませんか", "行きましょう", "祭り", "イベント", "飲みに行きます"],
        "vocab_details": [
            {"kanji": "今日", "kana": "きょう", "romaji": "kyou", "meaning": "Hoy", "type": "Tiempo"},
            {"kanji": "今週", "kana": "こんしゅう", "romaji": "konshuu", "meaning": "Esta semana", "type": "Tiempo"},
            {"kanji": "今度", "kana": "こんど", "romaji": "kondo", "meaning": "La próxima vez / Esta vez", "type": "Tiempo"}
        ],
        "examples": [
            {"jp": "日曜日に公園で夏祭りがあります。いっしょに行きませんか。", "kana": "にちようびにこうえんでなつまつりがあります。いっしょにいきませんか。", "romaji": "Nichiyoubi ni kouen de natsumatsuri ga arimasu. Issho ni ikimasen ka.", "es": "El domingo hay festival de verano en el parque. ¿No vienes conmigo?", "explanation": "Fórmula estándar de invitación a eventos."}
        ],
        "exercises": [
            {
                "id": "iro_12_1",
                "question": "¿Cómo invitas cordialmente diciendo '¿Comemos juntos?'?",
                "sentence": "いっしょに (　) か。",
                "options": ["食べません", "食べます", "食べた", "食べない"],
                "correct": "食べません",
                "explanation": "「食べませんか」 es la fórmula canónica de invitación en japonés."
            }
        ]
    },
    {
        "step": 113,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 7: 街を歩く (La Ciudad)",
        "lesson_num": 13,
        "level": "A1",
        "category": "Transporte y Estaciones",
        "title": "Irodori L13: このバスは空港に行きますか？ (¿Este autobús va al aeropuerto?)",
        "subtitle": "Transporte público, andenes, transbordos, duración y letreros de estación",
        "stage": "Sociedad A1",
        "icon": "🚌",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 336-368)",
        "objectives": [
            "Can-do 52: Preguntar si un autobús o tren va a nuestro destino y entender el andén.",
            "Can-do 53: Escuchar megafonías de tren y pedir ayuda a un pasajero si hay dudas.",
            "Can-do 54: Explicar el medio de transporte usado para ir al trabajo y cuánto demora.",
            "Can-do 55: Preguntar cómo llegar a un edificio público (ayuntamiento, oficina).",
            "Can-do 56: Interpretar letreros y pictogramas en estaciones de tren."
        ],
        "can_dos": [
            {"id": "Can-do 52", "task": "Preguntar por destinos de transporte", "sample": "このバスは空港に行きますか？ / 2番線です"},
            {"id": "Can-do 53", "task": "Consultar ubicación en tren", "sample": "すみません、今どこですか？"},
            {"id": "Can-do 54", "task": "Explicar desplazamientos y tiempos", "sample": "電車で来ます。1時間半かかります。"},
            {"id": "Can-do 55", "task": "Pedir rutas a oficinas públicas", "sample": "市役所まで、どうやって行きますか？"},
            {"id": "Can-do 56", "task": "Leer letreros de estaciones", "sample": "東口, 西口, 南口, 北口, 乗り換え"}
        ],
        "detailed_guide": "Para indicar el medio de transporte se usa 'Transporte + で' (電車で来ます - Vengo en tren). Para la duración se usa 'かかります' (1時間ぐらいかかります - Demora cerca de 1 hora). Para subir a un transporte se usa 'に' (バスに乗ります) y para descender se usa 'を' (バスを降ります). Puntos cardinales: 東 (este), 西 (oeste), 南 (sur), 北 (norte).",
        "grammar_focus": [
            "この【vehículo】は【lugar】に行きますか (Preguntar ruta)",
            "【Vehículo】で来ます / 行きます (Medio de locomoción)",
            "【Tiempo】かかります (Duración del viaje)",
            "【Lugar】で【vehículo】に乗ります / 降ります (Subir y bajar)",
            "Puntos cardinales: 東 (higashi), 西 (nishi), 南 (minami), 北 (kita)"
        ],
        "included_vocab": ["東", "西", "南", "北", "会社", "来ます", "行きます", "乗ります", "降ります", "電車", "バス", "空港", "時間", "かかります"],
        "vocab_details": [
            {"kanji": "東", "kana": "ひがし", "romaji": "higashi", "meaning": "Este", "type": "Punto cardinal"},
            {"kanji": "西", "kana": "にし", "romaji": "nishi", "meaning": "Oeste", "type": "Punto cardinal"},
            {"kanji": "南", "kana": "みなみ", "romaji": "minami", "meaning": "Sur", "type": "Punto cardinal"},
            {"kanji": "北", "kana": "きた", "romaji": "kita", "meaning": "Norte", "type": "Punto cardinal"},
            {"kanji": "会社", "kana": "かいしゃ", "romaji": "kaisha", "meaning": "Empresa / Compañía", "type": "Sustantivo"},
            {"kanji": "乗ります", "kana": "のります", "romaji": "norimasu", "meaning": "Subir a transporte", "type": "Verbo"}
        ],
        "examples": [
            {"jp": "会社まで電車で来ます。1時間ぐらいかかります。", "kana": "かいしゃまででんしゃできます。いちじかんぐらいかかります。", "romaji": "Kaisha made densha de kimasu. Ichijikan gurai kakarimasu.", "es": "Vengo a la empresa en tren. Demoro alrededor de 1 hora.", "explanation": "Descripción típica de desplazamiento al trabajo en Japón."}
        ],
        "exercises": [
            {
                "id": "iro_13_1",
                "question": "¿Qué partícula acompaña al medio de transporte utilizado (por ejemplo, en tren)?",
                "sentence": "電車 (　) 会社に行きます。",
                "options": ["で", "に", "を", "へ"],
                "correct": "で",
                "explanation": "で indica el instrumento o medio con el que se realiza la acción."
            }
        ]
    },
    {
        "step": 114,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 7: 街を歩く (La Ciudad)",
        "lesson_num": 14,
        "level": "A1",
        "category": "Calles y Orientación",
        "title": "Irodori L14: 大きな建物ですね (Es un edificio enorme)",
        "subtitle": "Servicios urbanos, cajeros ATM, puntos de encuentro y carteles",
        "stage": "Sociedad A1",
        "icon": "🏙️",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 369-394)",
        "objectives": [
            "Can-do 57: Preguntar dónde están los baños o cajeros automáticos (ATM).",
            "Can-do 58: Describir por teléfono la propia ubicación en un punto de encuentro (今、改札の前にいます).",
            "Can-do 59: Compartir impresiones al recorrer calles y zonas comerciales.",
            "Can-do 60: Interpretar letreros comerciales de apertura y cierre (営業中, 準備中, 定休日)."
        ],
        "can_dos": [
            {"id": "Can-do 57", "task": "Localizar aseos o cajeros en la calle", "sample": "この近くに、ATMはありますか？"},
            {"id": "Can-do 58", "task": "Coordinar encuentros por teléfono", "sample": "今、改札の前にいます"},
            {"id": "Can-do 59", "task": "Expresar impresiones de la ciudad", "sample": "にぎやかな通りですね / 広い公園ですね"},
            {"id": "Can-do 60", "task": "Leer avisos de comercios", "sample": "営業中 (abierto), 準備中 (en preparación)"}
        ],
        "detailed_guide": "Para encontrarte con alguien en una estación de tren, el punto de referencia estándar es '改札口の前' (delante de los tornos de billetes). Para describir la ubicación con respecto a objetos: 前 (delante), 後ろ (detrás), 横 (al lado). Para calificar un sustantivo con un adjetivo-na se añade 'na' (にぎやかな通り - calle animada).",
        "grammar_focus": [
            "【Lugar】に N（は）ありますか (Existencia de comercios en la zona)",
            "Nの【posición】にいます (Ubicación relativa: 前, 後ろ, 横)",
            "ナA-な Nですね / イA-い Nですね (Exclamación sobre características urbanas)",
            "Adjetivos opuestos: 大きい vs 小さい / 高い vs 低い"
        ],
        "included_vocab": ["大きい", "小さい", "高い", "低い", "前", "後ろ", "横", "建物", "改札", "コンビニ", "通り", "営業中"],
        "vocab_details": [
            {"kanji": "大きい", "kana": "おおきい", "romaji": "ookii", "meaning": "Grande", "type": "Adjetivo-i"},
            {"kanji": "小さい", "kana": "ちいさい", "romaji": "chiisai", "meaning": "Pequeño", "type": "Adjetivo-i"},
            {"kanji": "高い", "kana": "たかい", "romaji": "takai", "meaning": "Alto / Caro", "type": "Adjetivo-i"},
            {"kanji": "前", "kana": "まえ", "romaji": "mae", "meaning": "Delante", "type": "Posición"},
            {"kanji": "後ろ", "kana": "うしろ", "romaji": "ushiro", "meaning": "Detrás", "type": "Posición"},
            {"kanji": "横", "kana": "よこ", "romaji": "yoko", "meaning": "Al lado / Costado", "type": "Posición"}
        ],
        "examples": [
            {"jp": "もしもし。今、駅の改札の前にいます。", "kana": "もしもし。いま、えきのかいさつのまえにいます。", "romaji": "Moshimoshi. Ima, eki no kaisatsu no mae ni imasu.", "es": "Hola. Ahora estoy delante de los tornos de la estación.", "explanation": "Fórmula canónica para avisar tu paradero por móvil."}
        ],
        "exercises": [
            {
                "id": "iro_14_1",
                "question": "¿Qué cartel indica que un restaurante está actualmente abierto y atendiendo?",
                "sentence": "店の看板： (　) 。",
                "options": ["営業中", "準備中", "定休日", "入口"],
                "correct": "営業中",
                "explanation": "営業中 (eigyou-chuu) significa 'abierto / en servicio'."
            }
        ]
    },
    {
        "step": 115,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 8: 店で (En las Tiendas)",
        "lesson_num": 15,
        "level": "A1",
        "category": "Centros Comerciales y Compras",
        "title": "Irodori L15: 電池がほしいんですが… (Quisiera unas pilas...)",
        "subtitle": "Guías de pisos, plantas de tiendas departamentales y consultas a dependientes",
        "stage": "Sociedad A1",
        "icon": "🏬",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 395-421)",
        "objectives": [
            "Can-do 61: Preguntar dónde se puede comprar un artículo y comprender la respuesta.",
            "Can-do 62: Interpretar el directorio de plantas (floor guide) de un centro comercial.",
            "Can-do 63: Preguntar a los dependientes en qué piso se ubica una sección (カメラは何階ですか？).",
            "Can-do 64: Compartir comentarios espontáneos sobre artículos con amigos (わあ、かっこいいですね).",
            "Can-do 65: Reconocer la señalización estándar de tiendas (入口, 出口, 押す, 引く)."
        ],
        "can_dos": [
            {"id": "Can-do 61", "task": "Preguntar por comercios", "sample": "電池がほしいんですが、どこで買えますか？"},
            {"id": "Can-do 62", "task": "Leer floor guides de centros comerciales", "sample": "1F Comida, 2F Ropa, 3F Electrónica"},
            {"id": "Can-do 63", "task": "Preguntar al dependiente por la planta", "sample": "カメラは何階ですか？ / 4階です"},
            {"id": "Can-do 64", "task": "Comentar productos de compras", "sample": "このコート、おしゃれですね！ かわいい！"},
            {"id": "Can-do 65", "task": "Interpretar puertas de comercios", "sample": "入口, 出口, 押す (push), 引く (pull)"}
        ],
        "detailed_guide": "Para iniciar una consulta sobre lo que deseas comprar sin sonar abrupto, se utiliza 'N + がほしいんですが…' (el んですが suaviza la frase y actúa como pie para que el dependiente te asesore). Para preguntar por el piso se usa '何階ですか' (nan-gai desu ka). En las puertas automáticas y abatibles verás siempre 押す (empujar) y 引く (tirar).",
        "grammar_focus": [
            "Nがほしいんですが… (Planteamiento atenuado de deseo o búsqueda)",
            "〜は何階ですか (Preguntar por la planta de un edificio)",
            "Exclamaciones valorativas: かわいい！ / すてき！ / おしゃれですね",
            "Kanji de señalización: 入口, 出口, 押す, 引く, 安い"
        ],
        "included_vocab": ["入口", "出口", "階", "押す", "引く", "安い", "ほしい", "電池", "コート", "傘", "かわいい"],
        "vocab_details": [
            {"kanji": "入口", "kana": "いりぐち", "romaji": "iriguchi", "meaning": "Entrada", "type": "Sustantivo"},
            {"kanji": "出口", "kana": "でぐち", "romaji": "deguchi", "meaning": "Salida", "type": "Sustantivo"},
            {"kanji": "押す", "kana": "おす", "romaji": "osu", "meaning": "Empujar", "type": "Verbo"},
            {"kanji": "引く", "kana": "ひく", "romaji": "hiku", "meaning": "Tirar / Jalar", "type": "Verbo"},
            {"kanji": "安い", "kana": "やすい", "romaji": "yasui", "meaning": "Barato", "type": "Adjetivo-i"}
        ],
        "examples": [
            {"jp": "すみません、電池がほしいんですが、どこで買えますか。", "kana": "すみません、でんちがほしいんですが、どこでかえますか。", "romaji": "Sumimasen, denchi ga hoshii n desu ga, doko de kaemasu ka.", "es": "Disculpe, quisiera unas pilas, ¿dónde puedo comprarlas?", "explanation": "Estructura canónica para iniciar una compra en Japón."}
        ],
        "exercises": [
            {
                "id": "iro_15_1",
                "question": "¿Qué kanji encuentras en la puerta de una tienda que significa 'Empujar'?",
                "sentence": "ドアの表示： (　) 。",
                "options": ["押す", "引く", "入口", "出口"],
                "correct": "押す",
                "explanation": "押す (osu) significa empujar."
            }
        ]
    },
    {
        "step": 116,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 8: 店で (En las Tiendas)",
        "lesson_num": 16,
        "level": "A1",
        "category": "Precios y Caja de Combini",
        "title": "Irodori L16: これ、いくらですか？ (¿Cuánto cuesta esto?)",
        "subtitle": "Comprender precios, preguntas en caja del combini y descuentos",
        "stage": "Sociedad A1",
        "icon": "🏷️",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 422-451)",
        "objectives": [
            "Can-do 66: Escuchar y comprender el importe total anunciado por el cajero.",
            "Can-do 67: Preguntar el precio de un artículo (あのTシャツ、いくらですか？).",
            "Can-do 68: Solicitar cantidades de peso o unidades al corte (ひき肉200gください).",
            "Can-do 69: Responder a preguntas en caja del combini (¿desea calentar la comida?, ¿bolsa?, ¿cubiertos?).",
            "Can-do 70: Interpretar etiquetas de descuento (半額 - mitad de precio, 20%引き)."
        ],
        "can_dos": [
            {"id": "Can-do 66", "task": "Comprender precios orales", "sample": "1,980円です"},
            {"id": "Can-do 67", "task": "Preguntar precios al personal", "sample": "これ、いくらですか？ / そのカレンダー、いくらですか？"},
            {"id": "Can-do 68", "task": "Pedir carne o embutidos al peso", "sample": "ひき肉200gください"},
            {"id": "Can-do 69", "task": "Interactuar en caja de combini", "sample": "こちら、温めますか？ / お箸はおつけしますか？"},
            {"id": "Can-do 70", "task": "Interpretar etiquetas de rebajas", "sample": "半額 (50% de descuento), 100円引き"}
        ],
        "detailed_guide": "En la caja de los conbini (tiendas 24 horas), el cajero siempre hace preguntas clave: 1. 'こちら温めますか' (¿se lo caliento en microondas?), respondes 'お願いします' o '大丈夫です'. 2. '袋はおつけしますか' (¿le pongo bolsa de plástico?), respondes 'お願いします' o '要りません' (no hace falta).",
        "grammar_focus": [
            "これ／それ／あれ はいくらですか (Pregunta de precio)",
            "この／その／あの N (Demostrativo determinado)",
            "【Cantidad】ずつ (Distribución equitativa: 2個ずつ - dos de cada)",
            "Kanjis de números 1 al 10: 一, 二, 三, 四, 五, 六, 七, 八, 九, 十"
        ],
        "included_vocab": ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "いくら", "円", "温めます", "袋", "お箸", "半額"],
        "vocab_details": [
            {"kanji": "一", "kana": "いち", "romaji": "ichi", "meaning": "Uno", "type": "Número"},
            {"kanji": "十", "kana": "じゅう", "romaji": "juu", "meaning": "Diez", "type": "Número"},
            {"kanji": "半額", "kana": "はんがく", "romaji": "hangaku", "meaning": "Mitad de precio / 50% descuento", "type": "Sustantivo"}
        ],
        "examples": [
            {"jp": "店員：こちら、温めますか？　客：はい、お願いします。", "kana": "てんいん：こちら、あたためますか？　きゃく：はい、おねがいします。", "romaji": "Ten'in: Kochira, atatamemasu ka? Kyaku: Hai, onegai shimasu.", "es": "Cajero: ¿Desea que le caliente esto? Cliente: Sí, por favor.", "explanation": "Intercambio típico en la caja de cualquier combini en Japón."}
        ],
        "exercises": [
            {
                "id": "iro_16_1",
                "question": "¿Qué significa la etiqueta promocional '半額' que ponen a los bento al final de la tarde?",
                "sentence": "シールの表示： (　) 。",
                "options": ["Mitad de precio (50% de descuento)", "No disponible", "Producto caducado", "Solo para llevar"],
                "correct": "Mitad de precio (50% de descuento)",
                "explanation": "半額 (hangaku) significa exactamente 'mitad de precio'."
            }
        ]
    },
    {
        "step": 117,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 9: 休みの日に (Vacaciones)",
        "lesson_num": 17,
        "level": "A1",
        "category": "Días Libres y Experiencias",
        "title": "Irodori L17: 映画を見に行きました (Fui a ver una película)",
        "subtitle": "Relatar el fin de semana en pasado, tarifas de ocio y mensajes",
        "stage": "Consolidación A1",
        "icon": "🎬",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 452-477)",
        "objectives": [
            "Can-do 71: Responder con sencillez qué hicimos durante el fin de semana.",
            "Can-do 72: Preguntar y compartir impresiones sobre actividades pasadas (楽しかったです).",
            "Can-do 73: Leer publicaciones en redes sociales sobre salidas y excursiones.",
            "Can-do 74: Interpretar la lista de tarifas y precios de una atracción pública o museo.",
            "Can-do 75: Enviar mensajes breves de agradecimiento tras haber salido juntos."
        ],
        "can_dos": [
            {"id": "Can-do 71", "task": "Narrar actividades del día libre", "sample": "週末は何をしましたか？ / 映画を見に行きました"},
            {"id": "Can-do 72", "task": "Compartir impresiones de salidas", "sample": "国際フェスティバルは、とても楽しかったです"},
            {"id": "Can-do 73", "task": "Comprender crónicas de redes sociales", "sample": "家族で水族館に行きました"},
            {"id": "Can-do 74", "task": "Interpretar listas de tarifas", "sample": "Adultos, niños, tarifas de grupo"},
            {"id": "Can-do 75", "task": "Enviar mensajes de agradecimiento", "sample": "今、家に着きました。今日はありがとうございました。"}
        ],
        "detailed_guide": "Para hablar del pasado en japonés formal se conjugan los verbos en 〜ました (afirmativo) y 〜ませんでした (negativo). Para decir 'no hice nada' se combina 何も con verbo negativo: '何も しませんでした'. Los adjetivos-i pasan a 〜かったです (楽しい -> 楽しかったです) y su negativo pasado es 〜くなかったです.",
        "grammar_focus": [
            "V-ました / V-ませんでした (Pasado afirmativo y negativo)",
            "何も V-ませんでした / どこにも V-ませんでした (Negación total)",
            "ナA-でした / イA-かったです (Pasado de adjetivos)",
            "Kanjis: 百 (100), 千 (1000), 万 (10000), 円, 休み, 映画, 勉強します, 買います"
        ],
        "included_vocab": ["百", "千", "万", "円", "休み", "映画", "勉強します", "買います", "楽しかったです", "週末", "水族館"],
        "vocab_details": [
            {"kanji": "百", "kana": "ひゃく", "romaji": "hyaku", "meaning": "Cien", "type": "Número"},
            {"kanji": "千", "kana": "せん", "romaji": "sen", "meaning": "Mil", "type": "Número"},
            {"kanji": "万", "kana": "まん", "romaji": "man", "meaning": "Diez mil", "type": "Número"},
            {"kanji": "休み", "kana": "やすみ", "romaji": "yasumi", "meaning": "Descanso / Vacaciones", "type": "Sustantivo"},
            {"kanji": "映画", "kana": "えいが", "romaji": "eiga", "meaning": "Película", "type": "Sustantivo"}
        ],
        "examples": [
            {"jp": "週末は何をしましたか？　友だちと映画を見に行きました。とても楽しかったです。", "kana": "しゅうまつはなにをしましたか？　ともだちとえいがをみにいきました。とてもたのしかったです。", "romaji": "Shuumatsu wa nani o shimashita ka? Tomodachi to eiga o mi ni ikimashita. Totemo tanoshikatta desu.", "es": "¿Qué hiciste el fin de semana? Fui a ver una película con unos amigos. Fue muy divertido.", "explanation": "Diálogo completo de recapitulación de fin de semana."}
        ],
        "exercises": [
            {
                "id": "iro_17_1",
                "question": "¿Cómo dices 'No fui a ningún lugar' el fin de semana?",
                "sentence": "週末は、 (　) 行きませんでした。",
                "options": ["どこにも", "だれにも", "なにも", "いつも"],
                "correct": "どこにも",
                "explanation": "「どこにも + negativo」 significa 'a ningún sitio / a ningún lugar'."
            }
        ]
    },
    {
        "step": 118,
        "track": "irodori",
        "track_label": "Ruta Can-Do: Irodori A1 (Fundación Japón)",
        "module": "Tópico 9: 休みの日に (Vacaciones)",
        "lesson_num": 18,
        "level": "A1",
        "category": "Viajes y Cultura Onsen",
        "title": "Irodori L18: 温泉に入りたいです (Quiero bañarme en aguas termales)",
        "subtitle": "Planes para Golden Week, deseos personales, termas y conectores",
        "stage": "Consolidación A1",
        "icon": "♨️",
        "tab": "vocab",
        "sourcePdf": "irodori elementary.pdf (Págs. 478-505)",
        "objectives": [
            "Can-do 76: Preguntar y compartir planes para vacaciones largas (Golden Week).",
            "Can-do 77: Expresar deseos sobre actividades que se quiere vivir en Japón (温泉に入りたいです).",
            "Can-do 78: Publicar un resumen de un viaje en redes sociales.",
            "Can-do 79: Narrar un viaje e impresiones conectando frases con conectores (それから, それに, でも)."
        ],
        "can_dos": [
            {"id": "Can-do 76", "task": "Hablar de proyectos vacacionales", "sample": "ゴールデンウィークの予定は？ / どこか旅行したいです"},
            {"id": "Can-do 77", "task": "Expresar aspiraciones y deseos", "sample": "雪が見たいです。あと、温泉に入りたいです。"},
            {"id": "Can-do 78", "task": "Publicar fotos y crónicas de excursiones", "sample": "船に乗りました。景色がきれいでした。"},
            {"id": "Can-do 79", "task": "Narrar vivencias con conectores", "sample": "気持ちよかったです。それに、景色もきれいでした。"}
        ],
        "detailed_guide": "Para expresar deseos en primera persona se usa 'Verbo en forma たいです' (温泉に入りたいです - Quiero entrar a un onsen / bañarme en aguas termales). Para articular relatos fluidos se usan conectores: 'それから' (luego / después de eso), 'それに' (además / por si fuera poco) y 'でも' (pero / sin embargo).",
        "grammar_focus": [
            "V-たいです (Expresar deseos personales)",
            "どこか V-ます (Indefinido afirmativo: 'viajar a alguna parte')",
            "Conectores de discurso: それから (luego), それに (además), でも (sin embargo)",
            "Kanjis: 温泉, 予定, 来週, 会います, 入ります, 旅行します"
        ],
        "included_vocab": ["温泉", "予定", "来週", "会います", "入ります", "旅行します", "たいです", "それから", "それに", "でも", "ゴールデンウィーク"],
        "vocab_details": [
            {"kanji": "温泉", "kana": "おんせん", "romaji": "onsen", "meaning": "Aguas termales / Onsen", "type": "Sustantivo"},
            {"kanji": "予定", "kana": "よてい", "romaji": "yotei", "meaning": "Plan / Agenda prevista", "type": "Sustantivo"},
            {"kanji": "来週", "kana": "らいしゅう", "romaji": "raishuu", "meaning": "La próxima semana", "type": "Tiempo"},
            {"kanji": "旅行", "kana": "りょこう", "romaji": "ryokou", "meaning": "Viaje / Viajar", "type": "Sustantivo"}
        ],
        "examples": [
            {"jp": "ゴールデンウィークに温泉に入りたいです。露天風呂に入りました。気持ちよかったです。それに、景色もきれいでした。", "kana": "ゴールデンウィークにおんせんにはいりたいです。ろてんぶろにはいりました。きもちよかったです。それに、けしきもきれいでした。", "romaji": "Gooruden wiiku ni onsen ni hairitai desu. Rotenburo ni hairimashita. Kimochi yokatta desu. Soreni, keshiki mo kirei deshita.", "es": "En la Golden Week quiero ir a unas aguas termales. Me bañé en una terma al aire libre. Fue muy placentero. Además, el paisaje era precioso.", "explanation": "Relato culminante de viaje utilizando la gramática completa de Irodori A1."}
        ],
        "exercises": [
            {
                "id": "iro_18_1",
                "question": "¿Cómo expresas el deseo 'Quiero bañarme en aguas termales'?",
                "sentence": "温泉に (　) 。",
                "options": ["入りたいです", "入ります", "入りました", "入らないです"],
                "correct": "入りたいです",
                "explanation": "「入りたいです」 es la forma de deseo personal (~たいです) del verbo 入る (entrar / bañarse)."
            }
        ]
    }
]

# Add extra lessons if not present
for el in extra_lessons:
    if el["step"] not in existing_steps:
        all_curr.append(el)
    else:
        existing_steps[el["step"]].update(el)

all_curr.sort(key=lambda x: x["step"])
print(f"Total curriculum steps after adding all 18 Irodori lessons: {len(all_curr)}")

with open(curr_path, "w", encoding="utf-8") as f:
    json.dump(all_curr, f, ensure_ascii=False, indent=2)

print("Saved complete curriculum with all 18 Irodori lessons!")
