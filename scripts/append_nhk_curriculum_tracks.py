import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
curr_path = os.path.join(DATA_DIR, "curriculum.json")

all_curr = json.load(open(curr_path, encoding="utf-8"))
existing_steps = {c["step"]: c for c in all_curr}

nhk_blocks = [
    {
        "step": 201,
        "track": "nhk",
        "track_label": "Ruta Conversación NHK (Anna y Sakura)",
        "module": "Bloque 1: En la Universidad",
        "level": "N5",
        "category": "Vida Universitaria y Clases",
        "title": "NHK Módulo 1: En la Universidad (Lecciones 1-4, 8-10, 24-25)",
        "subtitle": "Presentaciones, aulas, normas de clase, horarios y simulacros de sismo",
        "stage": "Conversación N5",
        "icon": "🎓",
        "tab": "nhk",
        "sourcePdf": "japones from spanish.pdf (Lecciones 1-4, 8-10, 24-25)",
        "objectives": [
            "Presentarse con fórmulas naturales ante compañeros y docentes (はじめまして。私はアンナです).",
            "Ubicar las instalaciones universitarias (トイレはどこですか / ここは教室です).",
            "Seguir instrucciones del profesor en clase (もう一度お願いします / 辞書を使わないでください).",
            "Reaccionar con serenidad ante emergencias sísmicas (地震だ。机の下に入れ)."
        ],
        "detailed_guide": "Este bloque reúne todas las situaciones vividas por Anna en el campus de su universidad en Tokio: desde su primer encuentro con Sakura hasta cómo preguntar por instalaciones, pedir al profesor que repita y cómo actuar en un simulacro de terremoto.",
        "grammar_focus": [
            "Cópula です y partícula は (Topic marker)",
            "Demostrativos ここ, そこ, あそこ, どこ (Ubicación)",
            "Peticiones corteses con 〜てください",
            "Prohibición con 〜ないでください",
            "Imperativo de emergencia (机の下に入れ)"
        ],
        "included_vocab": ["はじめまして", "私", "学生", "先生", "教室", "図書館", "トイレ", "辞書", "地震", "試験"],
        "examples": [
            {"jp": "はじめまして。私はアンナです。よろしくお願いします。", "kana": "はじめまして。わたしはアンナです。よろしくおねがいします。", "romaji": "Hajimemashite. Watashi wa Anna desu. Yoroshiku onegai shimasu.", "es": "Mucho gusto. Soy Anna. Encantada de conocerte.", "explanation": "Presentación formal canónica."}
        ],
        "exercises": [
            {
                "id": "nhk_mod_1_1",
                "question": "¿Qué dice el profesor para ordenar protegerse bajo la mesa en un terremoto?",
                "sentence": "地震のとき： (　) 。",
                "options": ["机の下に入れ", "外に逃げろ", "窓を開けろ", "走れ"],
                "correct": "机の下に入れ",
                "explanation": "「机の下に入れ」 es la orden de protección sísmica en la Lección 25."
            }
        ]
    },
    {
        "step": 202,
        "track": "nhk",
        "track_label": "Ruta Conversación NHK (Anna y Sakura)",
        "module": "Bloque 2: En la Residencia de Estudiantes",
        "level": "N5-N4",
        "category": "Convivencia y Residencia",
        "title": "NHK Módulo 2: En la Residencia (Lecciones 5-6, 14-15, 23)",
        "subtitle": "Convivencia, normas del dormitorio, horas de llegada y voz pasiva",
        "stage": "Conversación N5-N4",
        "icon": "🚪",
        "tab": "nhk",
        "sourcePdf": "japones from spanish.pdf (Lecciones 5-6, 14-15, 23)",
        "objectives": [
            "Presentar la propia habitación y objetos queridos (それは私の宝物です).",
            "Intercambiar números telefónicos de contacto (電話番号は何番ですか).",
            "Consultar reglas de reciclaje y residuos (ここにゴミを捨ててもいいですか).",
            "Expresar que fuiste regañado por incumplir el horario de cierre (お母さんに叱られました)."
        ],
        "detailed_guide": "En la residencia de estudiantes de Anna (donde vive con la encargada 'Okâsan'), rigen estrictas normas de convivencia: separación de basura, toque de queda (門限 - mongen) y turnos de limpieza. Aquí se aprende la estructura de permiso 〜てもいいですか y la voz pasiva 〜られました.",
        "grammar_focus": [
            "Conexión de posesión con partícula の",
            "Expresión de permiso: 〜てもいいですか",
            "Forma continua: 〜ています (寝ています)",
            "Voz Pasiva (受身形): お母さんに叱られました"
        ],
        "included_vocab": ["ただいま", "おかえりなさい", "宝物", "電話番号", "ゴミ", "捨てます", "寝ています", "門限", "叱られました", "当番"],
        "examples": [
            {"jp": "ここにゴミを捨ててもいいですか。お母さんに叱られました。", "kana": "ここにごみをすててもいいですか。おかあさんにしかられました。", "romaji": "Koko ni gomi o sutete mo ii desu ka. Okaasan ni shikararemashita.", "es": "¿Puedo tirar la basura aquí? La encargada me regañó.", "explanation": "Reglas de residencia de estudiantes."}
        ],
        "exercises": [
            {
                "id": "nhk_mod_2_1",
                "question": "¿Cómo se dice 'fui regañada por la madre/encargada' en voz pasiva?",
                "sentence": "お母さんに (　) 。",
                "options": ["叱られました", "叱りました", "叱る", "叱らない"],
                "correct": "叱られました",
                "explanation": "叱られました es la forma pasiva en pasado del verbo 叱る."
            }
        ]
    },
    {
        "step": 203,
        "track": "nhk",
        "track_label": "Ruta Conversación NHK (Anna y Sakura)",
        "module": "Bloque 3: Compras y Restaurantes",
        "level": "N5-N4",
        "category": "Comercio y Gastronomía",
        "title": "NHK Módulo 3: Compras y Restaurantes (Lecciones 7, 13, 17, 34-35, 38, 42, 44)",
        "subtitle": "Pedir platos, consultar precios, tarjeta de crédito, Keigo y pagar por separado",
        "stage": "Conversación N5-N4",
        "icon": "🍣",
        "tab": "nhk",
        "sourcePdf": "japones from spanish.pdf (Lecciones 7, 13, 17, 34-35, 38, 42, 44)",
        "objectives": [
            "Pedir dulces y platos recomendados (シュークリームはありますか / おすすめは何ですか).",
            "Enlazar adjetivos para elogiar la comida (柔らかくておいしいです).",
            "Pagar la cuenta y verificar si aceptan tarjeta de crédito (クレジットカードは使えますか).",
            "Pedir la cuenta por separado (支払いは別々にお願いします) y comprender respuestas en Keigo (かしこまりました)."
        ],
        "detailed_guide": "El bloque comercial y gastronómico de la NHK enseña la interacción fluida con camareros, taxistas y cajeros. Cubre la conexión de adjetivos con 〜くて, la forma potencial (使えます), el superlativo con 一番 y la secuencia temporal con 〜てから en la ceremonia del té.",
        "grammar_focus": [
            "〜はありますか / 〜をください",
            "Conexión de Adjetivos-い: 〜くて (柔らかくておいしい)",
            "Forma Potencial: 使えます (¿se puede usar tarjeta?)",
            "Keigo de servicio: かしこまりました",
            "Pagar por separado: 別々にお願いします",
            "Secuencia temporal con 〜てから"
        ],
        "included_vocab": ["シュークリーム", "おすすめ", "柔らかい", "おいしい", "クレジットカード", "使えます", "かしこまりました", "和菓子", "抹茶", "別々に"],
        "examples": [
            {"jp": "支払いは別々にお願いします。クレジットカードは使えますか。", "kana": "しはらいはべつべつにおねがいします。クレジットカードはつかえますか。", "romaji": "Shiharai wa betsubetsu ni onegai shimasu. Kurejitto kaado wa tsukaemasu ka.", "es": "Cóbrenos por separado, por favor. ¿Se puede pagar con tarjeta?", "explanation": "Preguntas estándar en la caja de cualquier restaurante."}
        ],
        "exercises": [
            {
                "id": "nhk_mod_3_1",
                "question": "¿Cómo pides que la cuenta sea cobrada por separado para cada uno?",
                "sentence": "支払いは (　) お願いします。",
                "options": ["別々に", "いっしょに", "ぜんぶで", "もうすこし"],
                "correct": "別々に",
                "explanation": "「別々にお願いします」 significa 'por separado, por favor'."
            }
        ]
    },
    {
        "step": 204,
        "track": "nhk",
        "track_label": "Ruta Conversación NHK (Anna y Sakura)",
        "module": "Bloque 4: Cultura Japonesa y Festividades",
        "level": "N5-N4",
        "category": "Tradiciones y Cultura",
        "title": "NHK Módulo 4: Cultura Japonesa (Lecciones 11, 20, 27, 41, 45)",
        "subtitle": "Experiencias pasadas, festivales universitarios, karaoke y celebraciones",
        "stage": "Cultura N5-N4",
        "icon": "👘",
        "tab": "nhk",
        "sourcePdf": "japones from spanish.pdf (Lecciones 11, 20, 27, 41, 45)",
        "objectives": [
            "Expresar experiencias previas con 〜たことがある (日本の歌を歌ったことがありますか).",
            "Comentar noticias de bodas y festejos con el explicativo 〜んですか.",
            "Relatar la asistencia a festivales universitarios con ことができる (学園祭に行くことができて楽しかったです).",
            "Felicitar cumpleaños y entregar detalles de cortesía (お誕生日おめでとう / ほんの気持ちです)."
        ],
        "detailed_guide": "Este bloque explora las vivencias culturales de Anna: cantar en karaoke, asistir a un festival universitario (学園祭), celebrar cumpleaños con amigos y regalar obsequios con la tradicional fórmula de modestia 'ほんの気持ちです'.",
        "grammar_focus": [
            "Experiencias pasadas: Verbo Ta-form + ことがある",
            "Construcción explicativa: 〜んですか",
            "Capacidad y causa: 〜ことができて",
            "Cortesía de regalos: ほんの気持ちです"
        ],
        "included_vocab": ["歌", "歌ったことがあります", "結婚", "学園祭", "楽しかった", "誕生日", "おめでとう", "気持ち", "ぜひ"],
        "examples": [
            {"jp": "日本の歌を歌ったことがありますか。アンナ、お誕生日おめでとう！", "kana": "にほんのうたをうたったことがありますか。アンナ、おたんじょうびおめでとう！", "romaji": "Nihon no uta o utatta koto ga arimasu ka. Anna, otanjoubi omedetou!", "es": "¿Alguna vez has cantado canciones japonesas? ¡Anna, feliz cumpleaños!", "explanation": "Conversaciones culturales de la NHK."}
        ],
        "exercises": [
            {
                "id": "nhk_mod_4_1",
                "question": "¿Qué expresión utilizas al entregar un obsequio con cortesía y modestia?",
                "sentence": "プレゼントを渡すとき： これ、 (　) です。",
                "options": ["ほんの気持ち", "とても高いもの", "すごいもの", "おめでとう"],
                "correct": "ほんの気持ち",
                "explanation": "「ほんの気持ちです」 significa 'es solo un modesto detalle'."
            }
        ]
    },
    {
        "step": 205,
        "track": "nhk",
        "track_label": "Ruta Conversación NHK (Anna y Sakura)",
        "module": "Bloque 5: Viajes, Salidas y Monte Fuji",
        "level": "N5-N4",
        "category": "Excursiones y Viajes",
        "title": "NHK Módulo 5: Viajes y Monte Fuji (Lecciones 12, 16, 18, 28-33, 37, 46)",
        "subtitle": "Excursión a Shizuoka, ver el monte Fuji, fotos, futón y nieve en polvo",
        "stage": "Viajes N5-N4",
        "icon": "🚅",
        "tab": "nhk",
        "sourcePdf": "japones from spanish.pdf (Lecciones 12, 16, 18, 28-33, 37, 46)",
        "objectives": [
            "Orientarse en la calle si te pierdes (道に迷ってしまいました).",
            "Hacer conjeturas naturales con condicional 〜と (近くで見ると、大きいですね).",
            "Expresar deseos de fotografiar con 〜たいです (もう少し写真を撮りたいです).",
            "Comparar alojamientos (布団のほうが好きです) y verbos de dar (アンナさんにあげます).",
            "Enumerar recuerdos de viaje con 〜たり〜たり (富士山を見たり、お寿司を食べたりしました)."
        ],
        "detailed_guide": "El arco narrativo más célebre del curso de la NHK: el viaje de Anna a Shizuoka con Sakura y Kenta. Allí admira el monte Fuji, duerme en un futón japonés tradicional, come sushi toro y contempla la nieve en polvo antes de su regreso a Tailandia.",
        "grammar_focus": [
            "Acción involuntaria o pesar: 〜てしまいました",
            "Condicional natural con 〜と (見ると大きい)",
            "Deseos propios con 〜たいです",
            "Comparación de preferencia: A のほうが B より好き",
            "Verbos de dar y recibir: あげる vs くれる",
            "Enumeración representativa: 〜たり〜たりしました"
        ],
        "included_vocab": ["富士山", "写真", "撮りたい", "布団", "柔らかい", "あげます", "くれます", "見たり", "食べたり", "雪", "粉雪"],
        "examples": [
            {"jp": "富士山を見たり、お寿司を食べたりしました。布団のほうが好きです。", "kana": "ふじさんをみたり、おすしをたべたりしました。ふとんのほうがすきです。", "romaji": "Fujisan o mitari, osushi o tabetari shimashita. Futon no hou ga suki desu.", "es": "Vi el monte Fuji y comí sushi, entre otras cosas. Prefiero el futón.", "explanation": "Gramática de viajes de la NHK."}
        ],
        "exercises": [
            {
                "id": "nhk_mod_5_1",
                "question": "¿Cómo expresas que prefieres el futón a la cama?",
                "sentence": "布団 (　) 好きです。",
                "options": ["のほうが", "より", "から", "まで"],
                "correct": "のほうが",
                "explanation": "「Aのほうが好きです」 expresa preferencia comparativa ('prefiero A')."
            }
        ]
    },
    {
        "step": 206,
        "track": "nhk",
        "track_label": "Ruta Conversación NHK (Anna y Sakura)",
        "module": "Bloque 6: Ayuda, Salud y Urgencias",
        "level": "N5-N4",
        "category": "Salud y Bienestar",
        "title": "NHK Módulo 6: Salud y Urgencias (Lecciones 19, 22, 36, 39-40)",
        "subtitle": "Ir al médico, describir síntomas, fiebre, resfriado y deberes",
        "stage": "Salud N5-N4",
        "icon": "🏥",
        "tab": "nhk",
        "sourcePdf": "japones from spanish.pdf (Lecciones 19, 22, 36, 39-40)",
        "objectives": [
            "Disculparse por retrasos justificando la causa (遅くなりました).",
            "Expresar obligaciones académicas ineludibles (勉強しなければなりません).",
            "Describir dolencias al médico (熱があります / 咳が出ます / 風邪だと思います).",
            "Usar onomatopeyas corporales para describir dolor (頭がずきずきします)."
        ],
        "detailed_guide": "Cuando Anna enferma con fiebre y tos, la encargada la acompaña al hospital. Se enseña cómo dialogar con el médico, comprender diagnósticos con '〜と思います' y expresar dolores con la onomatopeya 'ずきずき'.",
        "grammar_focus": [
            "Cambio de estado: Forma-ku + なりました (遅くなりました)",
            "Obligación imprescindible: 〜なければなりません",
            "Opinión subjetiva: 〜と思います (風邪だと思います)",
            "Onomatopeyas físicas: 頭がずきずきします"
        ],
        "included_vocab": ["遅くなりました", "勉強しなければなりません", "風邪", "咳", "熱", "病院", "頭", "ずきずき", "おかゆ"],
        "examples": [
            {"jp": "熱が37.8度あります。頭がずきずきします。風邪だと思います。", "kana": "ねつがさんじゅうななてんはちどあります。あたまがずきずきします。かぜだとおもいます。", "romaji": "Netsu ga sanjuunanaten hachi do arimasu. Atama ga zukizuki shimasu. Kaze da to omoimasu.", "es": "Tengo 37,8 de fiebre. Me palpita la cabeza. Creo que es un resfriado.", "explanation": "Diálogo médico en la Lección 39 y 40."}
        ],
        "exercises": [
            {
                "id": "nhk_mod_6_1",
                "question": "¿Qué estructura indica obligación ('tengo que estudiar')?",
                "sentence": "大学で勉強 (　) 。",
                "options": ["しなければなりません", "してもいいです", "してください", "したことがあります"],
                "correct": "しなければなりません",
                "explanation": "〜なければなりません es la estructura que expresa obligación ineludible."
            }
        ]
    },
    {
        "step": 207,
        "track": "nhk",
        "track_label": "Ruta Conversación NHK (Anna y Sakura)",
        "module": "Bloque 7: Ocasiones Especiales y Despedida",
        "level": "N5-N4",
        "category": "Cierre y Metas Personales",
        "title": "NHK Módulo 7: Metas y Despedida (Lecciones 21, 26, 43, 47-48)",
        "subtitle": "Modestia, ánimo ante exámenes, proyectos de futuro y gratitud final",
        "stage": "Cierre N5-N4",
        "icon": "🎓",
        "tab": "nhk",
        "sourcePdf": "japones from spanish.pdf (Lecciones 21, 26, 43, 47-48)",
        "objectives": [
            "Responder a cumplidos con modestia japonesa (いいえ、それほどでも).",
            "Animar a compañeros con el modo volitivo (次はがんばろう).",
            "Expresar metas y proyectos con nominalización (日本語教師になるのが夢です).",
            "Despedirse agradeciendo todo el apoyo recibido (いろいろお世話になりました)."
        ],
        "detailed_guide": "El broche de oro del viaje de Anna en Japón: reflexionar sobre los sueños de futuro en clase y despedirse de sus amigos Kenta y Sakura en el aeropuerto con la frase de mayor gratitud de la cultura japonesa: 'いろいろお世話になりました'.",
        "grammar_focus": [
            "Modestia social: いいえ、それほどでも",
            "Modo Volitivo informal: がんばろう",
            "Nominalización con の: 〜になるのが夢です",
            "Despedida de honor y gratitud: いろいろお世話になりました"
        ],
        "included_vocab": ["それほどでも", "がんばろう", "夢", "日本語教師", "教えます", "お世話になりました", "体に気をつけて", "お元気で"],
        "examples": [
            {"jp": "日本語教師になるのが夢です。いろいろお世話になりました。", "kana": "にほんごきょうしになるのがゆめです。いろいろおせわになりました。", "romaji": "Nihongo-kyoushi ni naru no ga yume desu. Iroiro osewa ni narimashita.", "es": "Mi sueño es ser profesora de japonés. Muchísimas gracias por todas sus atenciones.", "explanation": "Conclusión del curso NHK."}
        ],
        "exercises": [
            {
                "id": "nhk_mod_7_1",
                "question": "¿Cuál es la expresión por excelencia de agradecimiento al terminar una estancia o etapa?",
                "sentence": "別れのあいさつ： (　) 。",
                "options": ["いろいろお世話になりました", "はじめまして", "どういたしまして", "いただきます"],
                "correct": "いろいろお世話になりました",
                "explanation": "「いろいろお世話になりました」 es la expresión japonesa canónica de agradecimiento por el apoyo recibido."
            }
        ]
    }
]

# Add NHK modules
for nb in nhk_blocks:
    if nb["step"] not in existing_steps:
        all_curr.append(nb)
    else:
        existing_steps[nb["step"]].update(nb)

all_curr.sort(key=lambda x: x["step"])
print(f"Total unified curriculum steps with NHK blocks: {len(all_curr)}")

with open(curr_path, "w", encoding="utf-8") as f:
    json.dump(all_curr, f, ensure_ascii=False, indent=2)

print("Saved curriculum.json with ALL tracks: Irodori A1, NHK World, and JLPT Progressive!")
