#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_preint_modules_29_to_37.py
Genera los módulos 29 a 37 correspondientes al manual oficial Irodori Pre-Intermediate (初中級).
Nivel asignado estrictamente: JLPT N3 (Regla 6).
"""

MODULES_29_TO_37 = [
    # =========================================================================
    # MÓDULO 29: OCIO MODERNO, CONVERSACIÓN COLOQUIAL Y CULTURA POP
    # =========================================================================
    {
        "step": 29,
        "title": "Ocio Moderno, Conversación Coloquial y Cultura Pop",
        "subtitle": "フットサルって何でしたっけ？ドラマを見るのが一番好きです。 (¿Qué era el fútbol sala? Lo que más me gusta es mirar series de televisión.)",
        "icon": "⚽",
        "level": "N3",
        "stage": "Módulo 29 · Comunicación Natural y Tendencias",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Pre-Intermediate (Lecciones 1 y 2, Págs. 1-28)"],
        "sourcePdf": "irodori_pre_intermediate.pdf",
        "detailed_guide": "La transición hacia el nivel intermedio N3 requiere dominar el habla natural de la juventud y el entorno social japonés. En este módulo se aprende a pedir aclaraciones o confirmar datos olvidados con la partícula informal de recuerdo 〜っけ, definir conceptos o citar temas mediante 〜って, y formular opiniones detalladas sobre cine, manga, anime y deportes exponiendo aficiones con 〜のが一番好き.",
        "objectives": [
            "Definir términos nuevos o temas de conversación usando la partícula temática informal 〜って.",
            "Confirmar datos de los que no se está completamente seguro usando 〜っけ.",
            "Reseñar películas, series o lecturas argumentando gustos con 〜のが一番好き."
        ],
        "can_dos": [
            {"id": "Can-do 01", "task": "Comprender la explicación sobre un deporte o afición popular y hacer preguntas al respecto", "sample": "フットサルってミニサッカーのことですか？"},
            {"id": "Can-do 03", "task": "Escribir un mensaje breve cancelando un plan con un amigo explicando los motivos", "sample": "急な用事ができて行けなくなってしまいました。"},
            {"id": "Can-do 05", "task": "Conversar con detalle sobre películas o mangas expresando impresiones y opiniones", "sample": "試合のシーンが本当にドキドキして面白かったです。"}
        ],
        "grammar_focus": [
            "Tópico informal y cita temática: 〜って (equivalente coloquial de 〜とは / 〜というのは)",
            "Confirmación retrospectiva de datos: 〜んだっけ / 〜でしたっけ ('¿cómo era que...?')",
            "Superlativo de preferencia personal: 〜のが一番好き / 〜のにハマっている"
        ],
        "included_vocab": ["フットサル", "ドラマ", "口コミ", "試合", "感動", "俳優", "評判", "おすすめ"],
        "vocab_details": [
            {"kanji": "試合", "kana": "しあい", "romaji": "shiai", "meaning": "partido / competición", "type": "Sustantivo"},
            {"kanji": "感動", "kana": "かんどう", "romaji": "kandou", "meaning": "emoción profunda / conmoverse", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "俳優", "kana": "はいゆう", "romaji": "haiyuu", "meaning": "actor / actriz", "type": "Sustantivo"},
            {"kanji": "評判", "kana": "ひょうばん", "romaji": "hyouban", "meaning": "fama / reputación / críticas", "type": "Sustantivo"},
            {"kanji": "口コミ", "kana": "くちこみ", "romaji": "kuchikomi", "meaning": "reseña de usuarios / boca a boca", "type": "Sustantivo"}
        ],
        "examples": [
            {
                "jp": "あの映画、結末がすごく意外で感動的でしたよ。",
                "kana": "あのえいが、けつまつがすごくいがいでかんどうてきでしたよ。",
                "romaji": "Ano eiga, ketsumatsu ga sugoku igai de kandouteki deshita yo.",
                "es": "Esa película tuvo un final muy inesperado y conmovedor.",
                "explanation": "Uso de adjetivo な 感動的 para expresar una impresión estética profunda."
            },
            {
                "jp": "明日の待ち合わせ時間って、何時でしたっけ？",
                "kana": "あしたのまちあわせじかんって、なんじでしたっけ？",
                "romaji": "Ashita no machiawase jikan tte, nanji deshita kke?",
                "es": "Oye, y la hora de encuentro de mañana, ¿a qué hora era?",
                "explanation": "Combinación de 〜って (tema coloquial) y 〜でしたっけ (confirmación de recuerdo)."
            }
        ],
        "exercises": [
            {
                "id": "m29_ex1",
                "question": "¿Qué partícula coloquial sustituye a というのは para definir de qué se habla en la conversación oral?",
                "sentence": "アニメフェス (　) どこで開催されるの？",
                "options": ["って", "ので", "のに", "たら"],
                "correct": "って",
                "explanation": "〜って es la contracción coloquial canónica de というのは o と para marcar temas citados."
            },
            {
                "id": "m29_ex2",
                "question": "¿Cómo preguntas '¿quién era esa persona?' cuando buscas recordar un dato?",
                "sentence": "あの人の名前、何 (　) ？",
                "options": ["だっけ", "だった", "である", "なのに"],
                "correct": "だっけ",
                "explanation": "〜だっけ se utiliza al intentar rescatar de la memoria un dato previamente conocido."
            },
            {
                "id": "m29_ex3",
                "question": "¿Qué palabra designa las reseñas u opiniones compartidas por usuarios en internet?",
                "sentence": "ネットの (　) を見てこの店を選びました。",
                "options": ["口コミ", "看板", "切符", "目次"],
                "correct": "口コミ",
                "explanation": "口コミ (kuchikomi) son las reseñas y opiniones de clientes o usuarios."
            },
            {
                "id": "m29_ex4",
                "question": "¿Cómo se expresa 'lo que más me gusta es ver partidos de fútbol'?",
                "sentence": "サッカーの試合を見る (　) が一番好きです。",
                "options": ["の", "こと", "もの", "そう"],
                "correct": "の",
                "explanation": "〜のが一番好き es la estructura más natural y fluida para declarar preferencias predilectas."
            }
        ],
        "related_topics": [
            {"step": 10, "title": "Aficiones, Tiempo Libre, Ocio y Redes Sociales", "icon": "📸", "relationship": "Precedente N5", "reason": "De los pasatiempos básicos en N5 se evoluciona a la argumentación crítica de cultura pop y reseñas en N3."},
            {"step": 16, "title": "Fin de Semana, Relatar el Pasado y Experiencias de Ocio", "icon": "🎡", "relationship": "Evolución Narrativa", "reason": "Profundiza en la narración de vivencias de ocio con expresiones coloquiales e interjecciones naturales."},
            {"step": 32, "title": "Convivencia Social, Nuevas Amistades y Reglas de Cortesía", "icon": "🤝", "relationship": "Consecutivo Natural", "reason": "Aplica estas pautas coloquiales para forjar amistades duraderas e integrarse en grupos comunitarios."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Citas temáticas y confirmaciones con 〜って y 〜っけ",
                "objective": "Aprender a definir términos coloquiales y contrastar recuerdos mediante partículas de conversación oral.",
                "grammar_points": [
                    {
                        "title": "Cita y definición temática: Sustantivo + って",
                        "formula": "Sustantivo / Frase + って (何ですか / どういう意味ですか)",
                        "explanation": "Equivale a 'en cuanto a X' o 'eso llamado X'. Es la forma oral abreviada de 'というのは' o 'と'. Muy usada para preguntar el significado de una palabra recién oída.",
                        "usage_notes": "En registros informales se utiliza directamente al inicio de la frase para introducir el foco de conversación.",
                        "examples": [
                            {"jp": "推し活って、具体的に何をするんですか？", "kana": "おしかつって、ぐたいてきになにをするんですか？", "es": "¿Qué se hace en concreto en lo que llaman 'oshikatsu' (apoyar a tu ídolo favorito)?"}
                        ]
                    },
                    {
                        "title": "Confirmación retrospectiva: Forma informal + っけ",
                        "formula": "Verbo [Forma た] + っけ / です + でしたっけ / だ + だっけ",
                        "explanation": "Se emplea cuando el hablante intenta recordar algo que ya sabía pero ha olvidado momentáneamente.",
                        "usage_notes": "Denota introspección o búsqueda activa en la memoria; es muy natural en la conversación entre iguales.",
                        "examples": [
                            {"jp": "田中さんの誕生日は来週でしたっけ？", "kana": "たなかさんのたんじょうびはらいしゅうでしたっけ？", "es": "¿El cumpleaños del señor Tanaka era la semana que viene, si mal no recuerdo?"}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 01", "task": "Comprender aficiones modernas y pedir aclaraciones", "sample": "フットサルって何でしたっけ？"}
                ],
                "vocab": [
                    {"kanji": "試合", "kana": "しあい", "meaning": "partido / encuentro deportivo", "type": "Sustantivo"},
                    {"kanji": "俳優", "kana": "はいゆう", "meaning": "actor / actriz", "type": "Sustantivo"},
                    {"kanji": "評判", "kana": "ひょうばん", "meaning": "reputación / críticas", "type": "Sustantivo"},
                    {"kanji": "口コミ", "kana": "くちこみ", "meaning": "reseña de usuarios", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "来週のライブのチケットって、もう取ったんだっけ？", "kana": "らいしゅうのらいぶのちけっとって、もうとったんだっけ？", "es": "Oye, ¿las entradas para el concierto de la semana que viene ya las habíamos comprado?"}
                ]
            },
            {
                "substep": 2,
                "title": "Crítica cultural y expresión de preferencias con 〜のが一番好き",
                "objective": "Emitir juicios argumentados sobre películas, libros y series recomendando contenidos.",
                "grammar_points": [
                    {
                        "title": "Expresión de predilección superlativa: Verbo [Forma Diccionario] + のが一番好き",
                        "formula": "[Acción sustantivada con の] が 一番 (すき / おもしろい / はまっている)",
                        "explanation": "Permite señalar con precisión qué actividad u obra es la favorita de uno, justificando los motivos de la elección.",
                        "usage_notes": "Suele complementarse con '〜という理由で' o '〜ところが魅力的で' en nivel N3.",
                        "examples": [
                            {"jp": "週末に家でゆっくり映画を見るのが一番好きです。", "kana": "しゅうまつにいえでゆっくりえいがをみるのがいちばんすきです。", "es": "Lo que más me gusta es mirar películas tranquilamente en casa el fin de semana."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 05", "task": "Conversar con detalle sobre cine y series", "sample": "ドラマを見るのが一番好きです。"}
                ],
                "vocab": [
                    {"kanji": "感動", "kana": "かんどう", "meaning": "emoción profunda", "type": "Sustantivo verbal"},
                    {"kanji": "おすすめ", "kana": "おすすめ", "meaning": "recomendación", "type": "Sustantivo"},
                    {"kanji": "意外", "kana": "いがい", "meaning": "inesperado / sorprendente", "type": "Adjetivo な"},
                    {"kanji": "結末", "kana": "けつまつ", "meaning": "desenlace / final", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "この漫画は主人公の成長が描かれていて感動的です。", "kana": "このまんがはしゅじんこうのせいちょうがかかれていてかんどうてきです。", "es": "Este manga describe el crecimiento del protagonista y resulta muy emotivo."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Ocio Moderno, Conversación Coloquial y Cultura Pop resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    },

    # =========================================================================
    # MÓDULO 30: VIVIENDA, BÚSQUEDA DE INMUEBLES Y RESOLUCIÓN DE AVERÍAS
    # =========================================================================
    {
        "step": 30,
        "title": "Vivienda, Búsqueda de Inmuebles y Resolución de Averías",
        "subtitle": "エアコンが壊れたみたいなんですが…引っ越しの準備はどうですか？ (Parece que el aire acondicionado se ha averiado... ¿Cómo van los preparativos de la mudanza?)",
        "icon": "🏢",
        "level": "N3",
        "stage": "Módulo 30 · Autonomía Residencial y Gestiones",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Pre-Intermediate (Lecciones 3 y 4, Págs. 29-56)"],
        "sourcePdf": "irodori_pre_intermediate.pdf",
        "detailed_guide": "Alquilar una vivienda autónoma en Japón implica entender conceptos inmobiliarios como fianza (敷金), dinero de agradecimiento no reembolsable (礼金) y gastos de comunidad. Asimismo, reportar averías de fontanería o climatización al conserje o agencia administradora exige la conjetura de evidencia indirecta 〜みたい (parece que...) para suavizar reclamos o quejas vecinales por ruidos.",
        "objectives": [
            "Comunicar desperfectos en el apartamento usando la inferencia 〜みたい.",
            "Formular quejas o peticiones a la inmobiliaria con explicaciones corteses.",
            "Interpretar contratos de arrendamiento y fichas técnicas de pisos (物件情報)."
        ],
        "can_dos": [
            {"id": "Can-do 07", "task": "Buscar y entender información sobre pisos en portales web de alquiler (alquiler, tamaño, ubicación)", "sample": "敷金と礼金がゼロの物件を探しています。"},
            {"id": "Can-do 10", "task": "Reportar averías del piso al administrador del edificio y coordinar la visita del técnico", "sample": "エアコンから変な音がして、冷えないみたいなんです。"},
            {"id": "Can-do 11", "task": "Transmitir quejas sobre ruidos molestos a la empresa administradora de la finca", "sample": "夜遅くの洗濯機の音で眠れないんです。"}
        ],
        "grammar_focus": [
            "Conjetura basada en indicios objetivos: 〜みたい (だ / です / な / に)",
            "Petición de auxilio o reparación: [Verbo Forma て] + いただけませんか",
            "Terminología inmobiliaria japonesa: 敷金 (fianza), 礼金 (reikin), 管理費, 築年数"
        ],
        "included_vocab": ["物件", "家賃", "敷金", "礼金", "修理", "業者", "騒音", "苦情"],
        "vocab_details": [
            {"kanji": "物件", "kana": "ぶっけん", "romaji": "bukken", "meaning": "inmueble / propiedad inmobiliaria", "type": "Sustantivo"},
            {"kanji": "家賃", "kana": "やちん", "romaji": "yachin", "meaning": "precio del alquiler mensual", "type": "Sustantivo"},
            {"kanji": "敷金", "kana": "しききん", "romaji": "shikikin", "meaning": "fianza / depósito de garantía", "type": "Sustantivo"},
            {"kanji": "礼金", "kana": "れいきん", "romaji": "reikin", "meaning": "gratificación al propietario (no reembolsable)", "type": "Sustantivo"},
            {"kanji": "修理", "kana": "しゅうり", "romaji": "shuuri", "meaning": "reparación", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "騒音", "kana": "そうおん", "romaji": "souon", "meaning": "ruido molesto / contaminación acústica", "type": "Sustantivo"}
        ],
        "examples": [
            {
                "jp": "お風呂の給湯器が故障したみたいで、お湯が全然出ないんです。",
                "kana": "おふろのきゅうとうきがこしょうしたみたいで、おゆがぜんぜんでないんです。",
                "romaji": "Ofuro no kyuutouki ga koshou shita mitai de, oyu ga zenzen denai n desu.",
                "es": "Parece que el calentador del baño se ha averiado; no sale nada de agua caliente.",
                "explanation": "故障した (averiado) + みたいで expresa una conjetura fundamentada en hechos palpables."
            },
            {
                "jp": "できるだけ早く修理業者を手配していただけないでしょうか？",
                "kana": "できるだけはやくしゅうりぎょうしゃをてはいしていただけないでしょうか？",
                "romaji": "Dekiru dake hayaku shuuri gyousha o tehai shite itadakenai deshoucha?",
                "es": "¿No sería tan amable de enviarme a un técnico de reparaciones lo más pronto posible?",
                "explanation": "Forma て + いただけないでしょうか es el nivel formal supremo para peticiones a administradores."
            }
        ],
        "exercises": [
            {
                "id": "m30_ex1",
                "question": "¿Cómo se dice 'parece que está roto' basándote en que no enciende?",
                "sentence": "洗濯機が (　) みたいです。",
                "options": ["壊れた", "壊れる", "壊して", "壊れそう"],
                "correct": "壊れた",
                "explanation": "Forma pasada informal (壊れた) + みたいです = parece que se ha roto."
            },
            {
                "id": "m30_ex2",
                "question": "¿Cómo se llama el depósito de garantía reembolsable al alquilar un apartamento en Japón?",
                "sentence": "契約時に (　) を2か月分支払いました。",
                "options": ["敷金", "礼金", "給料", "残業"],
                "correct": "敷金",
                "explanation": "敷金 (shikikin) es la fianza o depósito en garantía."
            },
            {
                "id": "m30_ex3",
                "question": "¿Cuál es la palabra para designar el ruido molesto en un vecindario?",
                "sentence": "上の部屋の足音の (　) に悩まされています。",
                "options": ["騒音", "発音", "音楽", "案内"],
                "correct": "騒音",
                "explanation": "騒音 (souon) significa ruido molesto o perturbador."
            },
            {
                "id": "m30_ex4",
                "question": "¿Qué palabra significa 'inmueble o piso en alquiler' en anuncios inmobiliarios?",
                "sentence": "駅から近いおすすめの (　) です。",
                "options": ["物件", "荷物", "道具", "部品"],
                "correct": "物件",
                "explanation": "物件 (bukken) es el término formal inmobiliario para pisos o propiedades."
            }
        ],
        "related_topics": [
            {"step": 6, "title": "El Hogar, Vivienda, Distribución y Electrodomésticos", "icon": "🛋️", "relationship": "Precedente Residencial", "reason": "De la distribución de habitaciones en N5 se pasa a contratos de alquiler y resolución de incidencias en N3."},
            {"step": 26, "title": "Servicios Públicos, Peluquería y Trámites", "icon": "✂️", "relationship": "Marco de Trámites", "reason": "Ambos módulos profundizan en la gestión de servicios y relación con intermediarios urbanos."},
            {"step": 31, "title": "Gastronomía Local, Cocina Casera y Nutrición", "icon": "🍳", "relationship": "Consecutivo Natural", "reason": "Una vez establecido en la vivienda, el siguiente paso es la gestión culinaria y vida autónoma."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Reporte de averías con 〜みたい",
                "objective": "Aprender a describir fallos en electrodomésticos o instalaciones del hogar suavizando el reporte mediante conjeturas.",
                "grammar_points": [
                    {
                        "title": "Conjetura inductiva por indicios: Forma informal + みたい",
                        "formula": "Verbo/Adj-い [Forma informal] + みたい / Sustantivo/Adj-な [sin だ] + みたい",
                        "explanation": "Expresa una conclusión o juicio basado en información sensorial que se observa o experimenta directamente ('parece que...', 'todo indica que...').",
                        "usage_notes": "A diferencia de 〜らしい (rumor oída de terceros), 〜みたい proviene de la propia percepción o deducción del hablante.",
                        "examples": [
                            {"jp": "水道管から水が漏れているみたいです。", "kana": "すいどうかんからみずがもれているみたいです。", "es": "Parece que está goteando agua de la tubería."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 10", "task": "Reportar problemas en el piso al casero", "sample": "エアコンが壊れたみたいなんですが…"}
                ],
                "vocab": [
                    {"kanji": "修理", "kana": "しゅうり", "meaning": "reparación", "type": "Sustantivo verbal"},
                    {"kanji": "業者", "kana": "ぎょうしゃ", "meaning": "técnico / contratista", "type": "Sustantivo"},
                    {"kanji": "騒音", "kana": "そうおん", "meaning": "ruido molesto", "type": "Sustantivo"},
                    {"kanji": "苦情", "kana": "くじょう", "meaning": "queja / reclamación", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "鍵の調子が悪いみたいなので、見てもらえますか？", "kana": "かぎのちょうしがわるいみたいなので、みてもらえますか？", "es": "Parece que la cerradura no funciona bien; ¿podría revisarla?"}
                ]
            },
            {
                "substep": 2,
                "title": "Contratos inmobiliarios y convivencia comunitaria",
                "objective": "Interpretar fichas de vivienda y redactar comunicaciones formales sobre convivencia.",
                "grammar_points": [
                    {
                        "title": "Petición respetuosa formal: Verbo [Forma て] + いただけないでしょうか",
                        "formula": "Verbo [Forma て] + いただけないでしょうか",
                        "explanation": "Fórmula de suma cortesía para solicitar la mediación o acción de un agente profesional o administrador.",
                        "usage_notes": "Indispensable para plantear reclamaciones sin generar fricciones con la administración de la finca.",
                        "examples": [
                            {"jp": "夜間の騒音について、注意文を掲示していただけないでしょうか？", "kana": "やかんのそうおんについて、ちゅういぶんをけいじしていただけないでしょうか？", "es": "¿Podrían publicar un aviso de atención sobre el ruido nocturno en el tablón?"}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 07", "task": "Entender ofertas en portales de pisos", "sample": "敷金・礼金なしの物件を探しています。"}
                ],
                "vocab": [
                    {"kanji": "物件", "kana": "ぶっけん", "meaning": "inmueble", "type": "Sustantivo"},
                    {"kanji": "家賃", "kana": "やちん", "meaning": "alquiler mensual", "type": "Sustantivo"},
                    {"kanji": "敷金", "kana": "しききん", "meaning": "fianza", "type": "Sustantivo"},
                    {"kanji": "礼金", "kana": "れいきん", "meaning": "gratificación al propietario", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "南向きで日当たりの良い部屋を希望しています。", "kana": "みなみむきでひあたりのよいへやをきぼうしています。", "es": "Deseo una habitación orientada al sur y con buena luz solar."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Vivienda, Búsqueda de Inmuebles y Resolución de Averías resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    }
]

print("generate_preint_modules_29_to_37 inicializado con M29 y M30.")

MODULES_31_TO_37 = [
    # =========================================================================
    # MÓDULO 31: GASTRONOMÍA LOCAL, COCINA CASERA Y NUTRICIÓN
    # =========================================================================
    {
        "step": 31,
        "title": "Gastronomía Local, Cocina Casera y Nutrición",
        "subtitle": "毎日栄養のバランスを考えて自炊するようにしています。 (Intento cocinarme a diario pensando en el equilibrio nutricional.)",
        "icon": "🍳",
        "level": "N3",
        "stage": "Módulo 31 · Alimentación y Bienestar",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Pre-Intermediate (Lecciones 5 y 6, Págs. 57-84)"],
        "sourcePdf": "irodori_pre_intermediate.pdf",
        "detailed_guide": "Cocinar de forma independiente en Japón (自炊) exige dominar ingredientes de supermercado, técnicas prácticas con microondas (電子レンジ調理) y vocabulario de nutrientes. Asimismo, se aprende a describir platos emblemáticos de la gastronomía regional (郷土料理) y a expresar hábitos conscientes de salud empleando la estructura de esfuerzo continuo 〜ようにしている.",
        "objectives": [
            "Expresar hábitos conscientes de salud y alimentación con [Verbo Diccionario / ない] + ようにしている.",
            "Describir la historia, origen e ingredientes de platos tradicionales regionales.",
            "Interpretar recetas de cocina y recomendaciones de dietistas en medios digitales."
        ],
        "can_dos": [
            {"id": "Can-do 15", "task": "Presentar a amigos un restaurante tradicional explicando sus especialidades y la sazón local", "sample": "本場の味付けで、とても美味しい郷土料理が食べられます。"},
            {"id": "Can-do 17", "task": "Comprender la explicación sobre el origen y forma de cocinar un plato típico regional", "sample": "栃木県の伝統料理で、節分の時期によく作られます。"},
            {"id": "Can-do 20", "task": "Explicar los hábitos alimenticios propios y los cuidados que se toman para mantener la salud", "sample": "野菜を多く摂るように気をつけています。"}
        ],
        "grammar_focus": [
            "Hábito consciente continuado: Verbo [Forma Diccionario / ない] + ようにしている",
            "Explicación del origen o procedencia de platos: 〜に由来している / 〜が発祥とされる",
            "Terminología culinaria y nutrición: 自炊, 栄養バランス, 調味料, 郷土料理"
        ],
        "included_vocab": ["自炊", "栄養", "調味料", "郷土料理", "野菜", "発祥", "健康", "調理"],
        "vocab_details": [
            {"kanji": "自炊", "kana": "じすい", "romaji": "jisui", "meaning": "cocinarse uno mismo en casa", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "栄養", "kana": "えいよう", "romaji": "eiyou", "meaning": "nutrición / nutrientes", "type": "Sustantivo"},
            {"kanji": "郷土料理", "kana": "きょうどりょうり", "romaji": "kyoudoryouri", "meaning": "plato regional tradicional", "type": "Sustantivo"},
            {"kanji": "調味料", "kana": "ちょうみりょう", "romaji": "choumiryou", "meaning": "condimento / aderezo", "type": "Sustantivo"},
            {"kanji": "健康", "kana": "けんこう", "romaji": "kenkou", "meaning": "salud / saludable", "type": "Sustantivo / Adj な"},
            {"kanji": "調理", "kana": "ちょうり", "romaji": "chouri", "meaning": "preparación culinaria", "type": "Sustantivo verbal (Suru)"}
        ],
        "examples": [
            {
                "jp": "健康のために、夜遅くには甘いものを食べないようにしています。",
                "kana": "けんこうのために、よるおそくにはあまいものをたべないようにしています。",
                "romaji": "Kenkou no tame ni, yoru osoku ni wa amai mono o tabenai you ni shite imasu.",
                "es": "Por mi salud, procuro conscientemente no comer cosas dulces a altas horas de la noche.",
                "explanation": "Forma negativa ない + ようにしています denota un esfuerzo constante por mantener una conducta saludable."
            },
            {
                "jp": "この鍋料理は、東北地方の寒い冬を乗り切るために生まれた郷土料理です。",
                "kana": "このなべりょうりは、とうほくちほうのさむいふゆをのりきるためにうまれたきょうどりょうりです。",
                "romaji": "Kono naberyouri wa, Touhoku chihou no samui fuyu o norikiru tame ni umareta kyoudoryouri desu.",
                "es": "Este guiso en cazuela es un plato tradicional regional nacido para superar los fríos inviernos de la región de Tohoku.",
                "explanation": "Descripción cultural contextualizada de un plato típico japonés."
            }
        ],
        "exercises": [
            {
                "id": "m31_ex1",
                "question": "¿Cómo se expresa 'me esfuerzo por hacer ejercicio todos los días como hábito'?",
                "sentence": "毎日運動を (　) ようにしています。",
                "options": ["する", "して", "した", "しよう"],
                "correct": "する",
                "explanation": "〜ようにしている se combina con la forma de diccionario: するようにしている."
            },
            {
                "id": "m31_ex2",
                "question": "¿Qué palabra significa 'cocinar tu propia comida en casa'?",
                "sentence": "節約のために平日は (　) しています。",
                "options": ["自炊", "外食", "配達", "注文"],
                "correct": "自炊",
                "explanation": "自炊 (jisui) es cocinar para uno mismo en lugar de comer fuera."
            },
            {
                "id": "m31_ex3",
                "question": "¿Cómo se dice 'plato tradicional característico de una región de Japón'?",
                "sentence": "旅行先で有名な (　) を食べました。",
                "options": ["郷土料理", "洋食", "中華", "ファストフード"],
                "correct": "郷土料理",
                "explanation": "郷土料理 (kyoudoryouri) designa la gastronomía autóctona de cada provincia."
            },
            {
                "id": "m31_ex4",
                "question": "¿Qué término hace referencia a los condimentos como sal, salsa de soja o miso?",
                "sentence": "日本の代表的な (　) は醤油と味噌です。",
                "options": ["調味料", "香辛料", "生ごみ", "食器"],
                "correct": "調味料",
                "explanation": "調味料 (choumiryou) engloba los condimentos culinarios."
            }
        ],
        "related_topics": [
            {"step": 4, "title": "Gustos, Preferencias Culinarias y Hábitos Diarios", "icon": "🍱", "relationship": "Fundamento N5", "reason": "De los gustos alimentarios básicos en N5 se progresa a hábitos nutricionales conscientes en N3."},
            {"step": 21, "title": "Restaurantes, Alergias y Dietas Especiales", "icon": "🍜", "relationship": "Precedente Gastronómico", "reason": "Complementa la selección de platos en restaurantes con la cocina casera y tradiciones regionales."},
            {"step": 36, "title": "Geografía Japonesa, Rutas Históricas y Crónicas de Viaje", "icon": "🗾", "relationship": "Vínculo Cultural", "reason": "Conecta la degustación de gastronomía regional con los viajes y exploración del Japón profundo."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Hábitos conscientes y disciplina con 〜ようにしている",
                "objective": "Aprender a manifestar pautas nutricionales y hábitos de vida saludables de forma regular.",
                "grammar_points": [
                    {
                        "title": "Hábito y esfuerzo voluntario: Verbo [Diccionario / ない] + ようにしている",
                        "formula": "Verbo [Forma Diccionario / Forma ない] + ようにしている (you ni shite iru)",
                        "explanation": "Indica que el hablante realiza un esfuerzo deliberado y continuo por mantener una pauta de conducta o hábito positivo (o evitar uno nocivo).",
                        "usage_notes": "A diferencia de 〜ことにしている (que recalca una decisión tomada), 〜ようにしている enfatiza el esfuerzo continuado por cumplirlo.",
                        "examples": [
                            {"jp": "油っこい料理は控えるようにしています。", "kana": "あぶらっこいりょうりはひかえるようにしています。", "es": "Procuro abstenerme de las comidas grasosas."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 20", "task": "Hablar de la dieta diaria y cuidados de salud", "sample": "自炊するようにしています。"}
                ],
                "vocab": [
                    {"kanji": "自炊", "kana": "じすい", "meaning": "cocinar en casa", "type": "Sustantivo verbal"},
                    {"kanji": "栄養", "kana": "えいよう", "meaning": "nutrición", "type": "Sustantivo"},
                    {"kanji": "健康", "kana": "けんこう", "meaning": "salud", "type": "Sustantivo"},
                    {"kanji": "野菜", "kana": "やさい", "meaning": "verdura", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "塩分を取りすぎないように気をつけています。", "kana": "えんぶんをとりすぎないようにきをつけています。", "es": "Tengo cuidado de no consumir exceso de sal."}
                ]
            },
            {
                "substep": 2,
                "title": "Gastronomía regional e identidad culinaria",
                "objective": "Describir el trasfondo histórico y la preparación de platos tradicionales japoneses.",
                "grammar_points": [
                    {
                        "title": "Explicación de antecedentes y origen cultural: 〜に由来する / 〜をきっかけに",
                        "formula": "[Nombre de plato] は [Región o Era] に 由来しています",
                        "explanation": "Estructura formal para narrar el nacimiento o procedencia de una costumbre culinaria autóctona.",
                        "usage_notes": "Aporta rigor cultural en conversaciones enriquecedoras con amigos o anfitriones.",
                        "examples": [
                            {"jp": "この料理は江戸時代に庶民の間で親しまれました。", "kana": "このりょうりはえどじだいにしょみんのあいだでしたしまれました。", "es": "Este plato fue muy apreciado por la gente del pueblo durante el período Edo."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 17", "task": "Entender la explicación y origen de platos regionales", "sample": "栃木県の伝統料理です。"}
                ],
                "vocab": [
                    {"kanji": "郷土料理", "kana": "きょうどりょうり", "meaning": "plato regional", "type": "Sustantivo"},
                    {"kanji": "調味料", "kana": "ちょうみりょう", "meaning": "condimentos", "type": "Sustantivo"},
                    {"kanji": "調理", "kana": "ちょうり", "meaning": "cocina / elaboración", "type": "Sustantivo verbal"},
                    {"kanji": "本場", "kana": "ほんば", "meaning": "lugar de origen auténtico", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "讃岐うどんの本場のコシを味わってください。", "kana": "さぬきうどんのほんばのこしをあじわってください。", "es": "Deguste la firmeza auténtica de los fideos Sanuki Udon en su tierra de origen."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Gastronomía Local, Cocina Casera y Nutrición resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    },

    # =========================================================================
    # MÓDULO 32: CONVIVENCIA SOCIAL, NUEVAS AMISTADES Y REGLAS DE CORTESÍA
    # =========================================================================
    {
        "step": 32,
        "title": "Convivencia Social, Nuevas Amistades y Reglas de Cortesía",
        "subtitle": "友だちになれたらいいなと思っています。隣に座ってもかまいませんか？ (Espero que podamos ser amigos. ¿Le importa si me siento a su lado?)",
        "icon": "🤝",
        "level": "N3",
        "stage": "Módulo 32 · Redes Sociales y Vínculos",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Pre-Intermediate (Lecciones 7 y 8, Págs. 85-112)"],
        "sourcePdf": "irodori_pre_intermediate.pdf",
        "detailed_guide": "Profundizar vínculos de amistad y compartir espacios públicos en Japón requiere fórmulas refinadas de consideración hacia el prójimo (気配り). En este módulo se aprende a solicitar permiso sin presionar mediante 〜てもかまわない (no hay inconveniente si...) y a manifestar anhelos sinceros de amistad mediante el deseo condicional reflexivo 〜たらいいな.",
        "objectives": [
            "Expresar deseos y esperanzas cordiales usando Verbo [Forma たら] + いいな.",
            "Solicitar o conceder permisos en situaciones comunitarias con Verbo [Forma て] + もかまわない.",
            "Integrarse en tertulias, eventos de voluntariado e intercambios culturales vecinales."
        ],
        "can_dos": [
            {"id": "Can-do 22", "task": "Iniciar una conversación con un desconocido en un evento social expresando deseos de amistad", "sample": "よかったら連絡先を交換して、友だちになれたら嬉しいです。"},
            {"id": "Can-do 25", "task": "Pedir permiso educadamente en lugares públicos o transporte para ocupar un espacio", "sample": "こちらの席、座ってもかまいませんか？"},
            {"id": "Can-do 28", "task": "Comprender reglas de convivencia vecinal y normas de cortesía comunitaria", "sample": "夜間の楽器演奏はご遠慮ください。"}
        ],
        "grammar_focus": [
            "Deseo y esperanza personal sincera: Verbo [Forma たら] + いいな (と思っています)",
            "Permiso y ausencia de objeción: Verbo [Forma て] + もかまわない (es aceptable / no importa si)",
            "Expresiones de consideración social: 遠慮なく (sin reparo), お互いに (mutuamente)"
        ],
        "included_vocab": ["交流", "連絡先", "交換", "遠慮", "お互い", "仲間", "親しい", "気軽"],
        "vocab_details": [
            {"kanji": "交流", "kana": "こうりゅう", "romaji": "kouryuu", "meaning": "intercambio cultural / socialización", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "連絡先", "kana": "れんらくさき", "romaji": "renrakusaki", "meaning": "datos de contacto", "type": "Sustantivo"},
            {"kanji": "交換", "kana": "こうかん", "romaji": "koukan", "meaning": "intercambio / trueque", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "遠慮", "kana": "えんりょ", "romaji": "enryo", "meaning": "reserva / contención por pudor", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "お互い", "kana": "おたがい", "romaji": "otagai", "meaning": "mutuamente / el uno al otro", "type": "Sustantivo adverbial"},
            {"kanji": "仲間", "kana": "なかま", "romaji": "nakama", "meaning": "compañero / camarada / colega", "type": "Sustantivo"}
        ],
        "examples": [
            {
                "jp": "日本語の練習相手になってくれる友だちができたらいいなと思っています。",
                "kana": "にほんごのれんしゅうあいてになってくれるともだちができたらいいなとおもっています。",
                "romaji": "Nihongo no renshuu aite ni natte kureru tomodachi ga dekitara ii na to omotte imasu.",
                "es": "Espero poder hacer un amigo que sea mi compañero de práctica de japonés.",
                "explanation": "Forma たら + いいな expresa un deseo íntimo que no depende por completo del control del hablante."
            },
            {
                "jp": "荷物が多いので、足元に置いてもかまいませんか？",
                "kana": "にもつがおおいので、あしもとにおいてもおまいませんか？",
                "romaji": "Nimotsu ga ooi node, ashimoto ni oite mo kamaimasen ka?",
                "es": "Como llevo bastante equipaje, ¿no habría inconveniente si lo pongo junto a mis pies?",
                "explanation": "Forma て + もかまいませんか solicita permiso con un matiz respetuoso de no incomodar."
            }
        ],
        "exercises": [
            {
                "id": "m32_ex1",
                "question": "¿Cómo se dice 'ojalá haga buen tiempo mañana'?",
                "sentence": "明日天気が (　) いいな。",
                "options": ["よかったら", "いいなら", "よくて", "いいと"],
                "correct": "よかったら",
                "explanation": "El adjetivo いい en condicional たら es よかったら: よかったらいいな (ojalá sea bueno)."
            },
            {
                "id": "m32_ex2",
                "question": "¿Cómo preguntas educadamente '¿le importa si abro la ventana?' usando かまわない?",
                "sentence": "少し窓を (　) かまいませんか？",
                "options": ["開けても", "開けたら", "開けると", "開ければ"],
                "correct": "開けても",
                "explanation": "Forma て + もかまいませんか es la fórmula canónica de cortesía."
            },
            {
                "id": "m32_ex3",
                "question": "¿Qué significa la fórmula de cortesía '遠慮なくどうぞ'?",
                "sentence": "お茶のおかわり、遠慮なくどうぞ： (　) 。",
                "options": ["Tómalo con total confianza / sin reparos", "No debes beber más", "Paga la cuenta", "Espera un momento"],
                "correct": "Tómalo con total confianza / sin reparos",
                "explanation": "遠慮なく significa 'sin reserva, sin pena, con toda confianza'."
            },
            {
                "id": "m32_ex4",
                "question": "¿Qué término significa 'datos de contacto' como número de teléfono o ID de mensajería?",
                "sentence": "よろしければ (　) を交換しませんか？",
                "options": ["連絡先", "履歴書", "不在票", "定期券"],
                "correct": "連絡先",
                "explanation": "連絡先 (renrakusaki) son las señas de contacto."
            }
        ],
        "related_topics": [
            {"step": 1, "title": "Saludos, Cortesía y Presentación Personal", "icon": "🤝", "relationship": "Evolución Social", "reason": "De los saludos de etiqueta básicos en N5 se evoluciona al establecimiento de lazos afectivos genuinos en N3."},
            {"step": 29, "title": "Ocio Moderno, Conversación Coloquial y Cultura Pop", "icon": "⚽", "relationship": "Contexto Conversacional", "reason": "Aporta los recursos comunicativos para conectar aficiones compartidas con nuevas amistades."},
            {"step": 35, "title": "Relaciones Interpersonales, Celebraciones y Consejos de Vida", "icon": "🎉", "relationship": "Consecutivo Natural", "reason": "Profundiza en la resolución de conflictos interpersonales y acompañamiento emocional."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Expresión de anhelos cordiales con 〜たらいいな",
                "objective": "Aprender a manifestar ilusiones y esperanzas compartidas de amistad e integración.",
                "grammar_points": [
                    {
                        "title": "Deseo no impositivo: Verbo [Forma たら] + いいな",
                        "formula": "Verbo / Adjetivo [Forma たら] + いいな (いいなあ / と思っている)",
                        "explanation": "Expresa un deseo o expectativa personal favorable ('ojalá ocurra...', 'qué bueno sería si...'). Es mucho más suave y humilde que 〜たい.",
                        "usage_notes": "Añadir 'と思っています' lo dota de mayor madurez y reflexión.",
                        "examples": [
                            {"jp": "来月みんなで一緒に旅行に行けたらいいですね。", "kana": "らいげつみんなでいっしょにりょこうにいけたらいいですね。", "es": "Qué bueno sería si pudiéramos ir todos juntos de viaje el próximo mes."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 22", "task": "Iniciar contactos y expresar deseos de amistad", "sample": "友だちになれたらいいな。"}
                ],
                "vocab": [
                    {"kanji": "交流", "kana": "こうりゅう", "meaning": "intercambio cultural", "type": "Sustantivo verbal"},
                    {"kanji": "仲間", "kana": "なかま", "meaning": "compañero", "type": "Sustantivo"},
                    {"kanji": "親しい", "kana": "したしい", "meaning": "cercano / íntimo", "type": "Adjetivo い"},
                    {"kanji": "気軽", "kana": "きがる", "meaning": "despreocupado / accesible", "type": "Adjetivo な"}
                ],
                "examples": [
                    {"jp": "お互いに助け合える関係になれたらいいですね。", "kana": "おたがいにたすけあえるかんけいになれたらいいですね。", "es": "Sería estupendo si pudiéramos forjar una relación donde nos apoyemos mutuamente."}
                ]
            },
            {
                "substep": 2,
                "title": "Consideración y solicitud de permiso con 〜てもかまわない",
                "objective": "Pedir y otorgar consentimiento respetando el espacio común y la privacidad.",
                "grammar_points": [
                    {
                        "title": "Permiso tolerante: Verbo [Forma て] + もかまわない",
                        "formula": "Verbo [Forma て] + もかまわない (kamaimasen / kamaimasen ka)",
                        "explanation": "Significa 'no hay problema si...', 'no importa que...'. En formato interrogativo (〜てもかまいませんか) es una de las fórmulas más educadas para no importunar.",
                        "usage_notes": "Deriva del verbo 構う (kamau: importar / preocupar). Negarlo implica que la acción no genera incomodidad.",
                        "examples": [
                            {"jp": "写真撮影をしてもかまいませんか？", "kana": "しゃしんさつえいをもしてもかまいませんか？", "es": "¿Habría algún inconveniente si tomo fotografías?"}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 25", "task": "Pedir permiso para ocupar un asiento o espacio", "sample": "隣に座ってもかまいませんか？"}
                ],
                "vocab": [
                    {"kanji": "連絡先", "kana": "れんらくさき", "meaning": "datos de contacto", "type": "Sustantivo"},
                    {"kanji": "交換", "kana": "こうかん", "meaning": "intercambio", "type": "Sustantivo verbal"},
                    {"kanji": "遠慮", "kana": "えんりょ", "meaning": "reserva / reparo", "type": "Sustantivo verbal"},
                    {"kanji": "お互い", "kana": "おたがい", "meaning": "mutuamente", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "どうぞ遠慮なくお使いください。", "kana": "どうぞえんりょなくおつかいください。", "es": "Por favor, utilícelo con total libertad."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Convivencia Social, Nuevas Amistades y Reglas de Cortesía resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    },

    # =========================================================================
    # MÓDULO 33: METACOGNICIÓN LINGÜÍSTICA Y MÉTODOS DE APRENDIZAJE
    # =========================================================================
    {
        "step": 33,
        "title": "Metacognición Lingüística y Métodos de Aprendizaje",
        "subtitle": "日本語に興味を持ったきっかけは何ですか？読解のコツを身につけました。 (¿Cuál fue el motivo inicial por el que te interesaste en el japonés? Adquirí las claves de la comprensión lectora.)",
        "icon": "📚",
        "level": "N3",
        "stage": "Módulo 33 · Aprendizaje Estratégico y Motivación",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Pre-Intermediate (Lecciones 9 y 10, Págs. 113-140)"],
        "sourcePdf": "irodori_pre_intermediate.pdf",
        "detailed_guide": "Alcanzar el nivel intermedio N3 requiere reflexionar conscientemente sobre las propias estrategias de aprendizaje (metacognición). En este módulo se aprende a compartir el motivo o detonante vocacional inicial mediante el sustantivo clave きっかけ (el origen / la chispa que lo inició), y a argumentar métodos eficaces de estudio (memorización con flashcards, sombreado vocal o lectura veloz) usando la causa instrumental 〜ことによって.",
        "objectives": [
            "Explicar el motivo o circunstancia que despertó el interés por Japón con 〜をきっかけに.",
            "Debatir técnicas de memorización y estrategias de lectura comprensiva.",
            "Describir rutinas autónomas de estudio con aplicaciones y podcasts."
        ],
        "can_dos": [
            {"id": "Can-do 29", "task": "Explicar a profesores y compañeros qué motivo te llevó a estudiar japonés", "sample": "日本のアニメを見たのをきっかけに、勉強を始めました。"},
            {"id": "Can-do 31", "task": "Comprender artículos sobre técnicas de estudio eficaces y gestión del tiempo", "sample": "毎日15分継続することによって記憶が定着します。"},
            {"id": "Can-do 34", "task": "Compartir recomendaciones sobre aplicaciones y herramientas digitales de aprendizaje", "sample": "単語アプリを使うと効率よく覚えられます。"}
        ],
        "grammar_focus": [
            "Detonante o punto de partida causal: Sustantivo + をきっかけに (して / として)",
            "Medio o instrumento causal formal: Verbo [Forma Diccionario] + ことによって ('mediante / a través de')",
            "Estrategias pedagógicas: 暗記 (memorización), 効率 (eficiencia), 継続 (constancia)"
        ],
        "included_vocab": ["きっかけ", "興味", "効率", "継続", "暗記", "読解", "語彙", "方法"],
        "vocab_details": [
            {"kanji": "興味", "kana": "きょうみ", "romaji": "kyoumi", "meaning": "interés / curiosidad", "type": "Sustantivo"},
            {"kanji": "効率", "kana": "こうりつ", "romaji": "kouritsu", "meaning": "eficiencia / rendimiento", "type": "Sustantivo"},
            {"kanji": "継続", "kana": "けいぞく", "romaji": "keizoku", "meaning": "continuidad / constancia", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "暗記", "kana": "あんき", "romaji": "anki", "meaning": "memorización / aprender de memoria", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "語彙", "kana": "ごい", "romaji": "goi", "meaning": "vocabulario / léxico", "type": "Sustantivo"},
            {"kanji": "読解", "kana": "どっかい", "romaji": "dokkai", "meaning": "comprensión lectora", "type": "Sustantivo verbal (Suru)"}
        ],
        "examples": [
            {
                "jp": "日本への旅行をきっかけに、本格的に日本語の文法を学び始めました。",
                "kana": "にほんへのりょこうをきっかけに、ほんかくてきににほんごのぶんぽうをまなびはじめました。",
                "romaji": "Nihon e no ryokou o kikkake ni, honkakuteki ni Nihongo no bunpou o manabihajimemashita.",
                "es": "A raíz de un viaje a Japón, comencé a estudiar seriamente la gramática japonesa.",
                "explanation": "Sustantivo (旅行) + をきっかけに señala el acontecimiento que desencadenó el nuevo hábito."
            },
            {
                "jp": "音声を聞きながらシャドーイングすることによって、発音を改善できました。",
                "kana": "おんせいをききながらしゃどーいんぐすることによって、はつおんをかいぜんできました。",
                "romaji": "Onsei o kikinagara shadouingu suru koto ni yotte, hatsuon o kaizen dekimashita.",
                "es": "A través de hacer shadowing mientras escucho el audio, pude mejorar mi pronunciación.",
                "explanation": "ことによって denota el método o medio por el cual se obtiene un resultado exitoso."
            }
        ],
        "exercises": [
            {
                "id": "m33_ex1",
                "question": "¿Qué expresión denota el detonante o suceso inicial que motivó un cambio de vida?",
                "sentence": "留学を (　) 、視野が大きく広がりました。",
                "options": ["きっかけに", "ばかりに", "せいで", "かわりに"],
                "correct": "きっかけに",
                "explanation": "〜をきっかけに expresa 'a raíz de / teniendo como detonante inicial'."
            },
            {
                "id": "m33_ex2",
                "question": "¿Cómo se dice 'mediante la práctica diaria' en un registro formal intermedio?",
                "sentence": "毎日練習する (　) 、上達しました。",
                "options": ["ことによって", "ことにして", "ことになって", "こととて"],
                "correct": "ことによって",
                "explanation": "ことによって expresa 'mediante / a través del método de'."
            },
            {
                "id": "m33_ex3",
                "question": "¿Qué palabra significa 'memorización' en el estudio de vocabulario?",
                "sentence": "英単語の (　) は毎日コツコツ行うのが大切です。",
                "options": ["暗記", "換気", "点検", "苦情"],
                "correct": "暗記",
                "explanation": "暗記 (anki) es memorizar palabras o conceptos."
            },
            {
                "id": "m33_ex4",
                "question": "¿Cuál es la palabra que define la 'constancia o continuidad' en el estudio?",
                "sentence": "語学学習で最も重要なのは (　) です。",
                "options": ["継続", "中止", "割引", "避難"],
                "correct": "継続",
                "explanation": "継続 (keizoku) es la continuidad y perseverancia."
            }
        ],
        "related_topics": [
            {"step": 2, "title": "Estrategias de Comunicación y Gestión de Idiomas", "icon": "💬", "relationship": "Fundamento N5", "reason": "De pedir aclaraciones simples en N5 se evoluciona al autoanálisis y métodos de estudio autónomos en N3."},
            {"step": 19, "title": "Metas Personales, Despedidas y Expresiones de Gratitud", "icon": "🎓", "relationship": "Motivación Vital", "reason": "Conecta el trazado de metas con las herramientas cognitivas para hacerlas realidad."},
            {"step": 28, "title": "Proyección Vital, Logros y Emprendimiento", "icon": "🚀", "relationship": "Precedente N4", "reason": "Vincula la adquisición de facultades con la reflexión sistemática sobre el proceso de aprendizaje."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "El detonante vocacional: 〜をきっかけに",
                "objective": "Aprender a estructurar relatos personales sobre las motivaciones que impulsan el aprendizaje del idioma.",
                "grammar_points": [
                    {
                        "title": "Motivo desencadenante: Sustantivo + をきっかけに (して)",
                        "formula": "Sustantivo / [Verbo Diccionario + の] + をきっかけに (して / として)",
                        "explanation": "Señala la ocasión o hecho particular que sirvió de detonante para emprender una actividad o provocar un cambio en la vida del hablante.",
                        "usage_notes": "Muy habitual en entrevistas de trabajo (面接) al responder por qué se decidió estudiar en Japón.",
                        "examples": [
                            {"jp": "日本料理の美味しさに感動したのをきっかけに、和食の料理人を目指しました。", "kana": "にほんりょうりのおいしさにかんどうしたのをきっかけに、わしょくのりょうりにんをめざしました。", "es": "A raíz de conmoverme con lo deliciosa que era la cocina japonesa, aspiré a ser chef de comida tradicional."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 29", "task": "Explicar el motivo que te llevó a estudiar japonés", "sample": "アニメをきっかけに始めました。"}
                ],
                "vocab": [
                    {"kanji": "興味", "kana": "きょうみ", "meaning": "interés", "type": "Sustantivo"},
                    {"kanji": "きっかけ", "kana": "きっかけ", "meaning": "detonante / ocasión", "type": "Sustantivo"},
                    {"kanji": "語彙", "kana": "ごい", "meaning": "léxico / vocabulario", "type": "Sustantivo"},
                    {"kanji": "読解", "kana": "どっかい", "meaning": "comprensión lectora", "type": "Sustantivo verbal"}
                ],
                "examples": [
                    {"jp": "友人に誘われたのをきっかけに、茶道を習い始めました。", "kana": "ゆうじんにさそわれたのをきっかけに、さどうをならいはじめました。", "es": "A raíz de que me invitó un amigo, empecé a aprender la ceremonia del té."}
                ]
            },
            {
                "substep": 2,
                "title": "Estrategias de eficiencia y el medio causal con 〜ことによって",
                "objective": "Analizar métodos eficaces de estudio fundamentando los resultados con 〜ことによって.",
                "grammar_points": [
                    {
                        "title": "Causalidad instrumental formal: Verbo [Diccionario] + ことによって",
                        "formula": "Verbo [Forma Diccionario] + ことによって / ことにより",
                        "explanation": "Indica el método, técnica o vía a través de la cual se alcanza un resultado o mejora sustancial ('mediante el hecho de...').",
                        "usage_notes": "Es una fórmula común en ensayos explicativos, artículos científicos y presentaciones.",
                        "examples": [
                            {"jp": "毎日声に出して読むことによって、読解スピードが上がりました。", "kana": "まいにちこえにだしてよむことによって、どっかいすぴーどがあがりました。", "es": "Mediante la lectura en voz alta a diario, mi velocidad de comprensión lectora aumentó."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 31", "task": "Comprender técnicas de estudio y gestión del tiempo", "sample": "復習することによって記憶に残ります。"}
                ],
                "vocab": [
                    {"kanji": "効率", "kana": "こうりつ", "meaning": "eficiencia", "type": "Sustantivo"},
                    {"kanji": "継続", "kana": "けいぞく", "meaning": "continuidad", "type": "Sustantivo verbal"},
                    {"kanji": "暗記", "kana": "あんき", "meaning": "memorización", "type": "Sustantivo verbal"},
                    {"kanji": "方法", "kana": "ほうほう", "meaning": "método / vía", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "アプリを活用することによって、隙間時間を有効に使えます。", "kana": "あぷりをかつようすることによって、すきまじかんをゆうこうにつかえます。", "es": "A través del aprovechamiento de aplicaciones, se pueden aprovechar los tiempos muertos de forma productiva."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Metacognición Lingüística y Métodos de Aprendizaje resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    },

    # =========================================================================
    # MÓDULO 34: PREVENCIÓN DE FRAUDES, EMERGENCIAS Y SEGURIDAD CIUDADANA
    # =========================================================================
    {
        "step": 34,
        "title": "Prevención de Fraudes, Emergencias y Seguridad Ciudadana",
        "subtitle": "詐欺メールに気をつけてください。警察や救急車を呼んでほしいんです。 (Tenga cuidado con los correos de fraude. Necesito que llamen a la policía o a la ambulancia.)",
        "icon": "🛡️",
        "level": "N3",
        "stage": "Módulo 34 · Protección Civil y Asistencia Legal",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Pre-Intermediate (Lecciones 11 y 12, Págs. 141-168)"],
        "sourcePdf": "irodori_pre_intermediate.pdf",
        "detailed_guide": "La seguridad ciudadana en Japón incluye la protección ante estafas digitales (phishing, SMS fraudulentos) y la gestión de emergencias médicas o incidentes en la comisaría de barrio (交番). En este módulo se aprende a solicitar de terceros acciones protectoras inmediatas mediante 〜てほしい (quiero que hagas tú...), a redactar avisos de alerta y a cooperar en denuncias policiales.",
        "objectives": [
            "Expresar deseos de que otra persona realice una acción urgente con Verbo [Forma て] + ほしい.",
            "Reconocer fraudes por correo electrónico, SMS bancarios y enlaces sospechosos.",
            "Denunciar extravíos o solicitar socorro médico llamando al 110 (policía) o 119 (bomberos/ambulancia)."
        ],
        "can_dos": [
            {"id": "Can-do 36", "task": "Identificar intentos de estafa o phishing en mensajes recibidos y advertir a otros", "sample": "不審なリンクは絶対に開かないでください。"},
            {"id": "Can-do 38", "task": "Explicar en un centro de policía (交番) el extravío o robo de pertenencias", "sample": "財布を落としたので、遺失物届を出したいです。"},
            {"id": "Can-do 41", "task": "Pedir ayuda a personas cercanas en caso de accidente o emergencia médica", "sample": "けが人がいるので、救急車を呼んでほしいです。"}
        ],
        "grammar_focus": [
            "Deseo de acción ajena: Persona に + Verbo [Forma て] + ほしい ('quiero que tú hagas')",
            "Advertencia y precaución perentoria: 〜に気をつける / 不審な〜",
            "Llamadas de emergencia oficiales: 110番 (警察), 119番 (消防・救急)"
        ],
        "included_vocab": ["詐欺", "被害", "不審", "救急車", "警察", "落とす", "盗難", "届ける"],
        "vocab_details": [
            {"kanji": "詐欺", "kana": "さぎ", "romaji": "sagi", "meaning": "fraude / estafa", "type": "Sustantivo"},
            {"kanji": "被害", "kana": "ひがい", "romaji": "higai", "meaning": "daño sufrido / perjuicio", "type": "Sustantivo"},
            {"kanji": "不審", "kana": "ふしん", "romaji": "fushin", "meaning": "sospechoso / dudoso", "type": "Adj な / Sustantivo"},
            {"kanji": "救急車", "kana": "きゅうきゅうしゃ", "romaji": "kyuukyuusha", "meaning": "ambulancia", "type": "Sustantivo"},
            {"kanji": "盗難", "kana": "とうなん", "romaji": "tounan", "meaning": "robo / sustracción", "type": "Sustantivo"},
            {"kanji": "落とす", "kana": "おとす", "romaji": "otosu", "meaning": "perder / dejar caer", "type": "Verbo Godan"}
        ],
        "examples": [
            {
                "jp": "友人が倒れて意識がないので、すぐに救急車を呼んでほしいです！",
                "kana": "ゆうじんがたおれていしきがないので、すぐにきゅうきゅうしゃをよんでほしいです！",
                "romaji": "Yuujin ga taorete ishiki ga nai node, sugu ni kyuukyuusha o yonde hoshii desu!",
                "es": "¡Mi amigo se desplomó y está inconsciente, necesito que llamen a una ambulancia de inmediato!",
                "explanation": "呼んでほしい expresa la necesidad urgente de que el interlocutor haga esa llamada vital."
            },
            {
                "jp": "銀行を名乗る不審なメールが届いても、パスワードは入力しないでください。",
                "kana": "ぎんこうをなのるふしんなめーるがとどいても、ぱすわーどはにゅうりょくしないでください。",
                "romaji": "Ginkou o nanoru fushin na meeru ga todoite mo, pasuwaado wa nyuuryoku shinaide kudasai.",
                "es": "Aunque le llegue un correo sospechoso haciéndose pasar por el banco, no ingrese su contraseña.",
                "explanation": "Advertencia formal contra el phishing bancario."
            }
        ],
        "exercises": [
            {
                "id": "m34_ex1",
                "question": "¿Cómo expresas 'quiero que me ayudes' usando la estructura ほしい?",
                "sentence": "荷物を運ぶのを (　) ほしいです。",
                "options": ["手伝って", "手伝いたく", "手伝う", "手伝えば"],
                "correct": "手伝って",
                "explanation": "Forma て (手伝って) + ほしい expresa el deseo de que la otra persona actúe."
            },
            {
                "id": "m34_ex2",
                "question": "¿Cuál es el número de teléfono de emergencias para llamar a una ambulancia o a los bomberos en Japón?",
                "sentence": "火事や急病の時は (　) に電話します。",
                "options": ["119番", "110番", "104番", "117番"],
                "correct": "119番",
                "explanation": "119 es el número de bomberos y ambulancias (110 es exclusivo de la policía)."
            },
            {
                "id": "m34_ex3",
                "question": "¿Qué palabra define a un correo electrónico engañoso de estafa?",
                "sentence": "個人情報を盗む (　) メールに注意しましょう。",
                "options": ["詐欺", "親切", "観光", "初詣"],
                "correct": "詐欺",
                "explanation": "詐欺 (sagi) significa fraude o estafa."
            },
            {
                "id": "m34_ex4",
                "question": "¿Qué trámite se realiza en el Kōban cuando se pierde la cartera?",
                "sentence": "交番で (　) 届を出しました。",
                "options": ["遺失物", "参加", "予約", "割引"],
                "correct": "遺失物",
                "explanation": "遺失物届 (ishitsubutsutodoke) es el parte oficial de objetos extraviados."
            }
        ],
        "related_topics": [
            {"step": 18, "title": "Salud, Síntomas Corporales y Deberes Ineludibles", "icon": "💊", "relationship": "Fundamento N5", "reason": "De los síntomas leves en el médico se avanza a emergencias vitales y asistencia jurídica en N3."},
            {"step": 27, "title": "Medio Ambiente, Prevención de Desastres y Sismos", "icon": "🚨", "relationship": "Marco Preventivo", "reason": "Complementa la prevención ante desastres naturales con la seguridad ciudadana y ciberseguridad."},
            {"step": 35, "title": "Relaciones Interpersonales, Celebraciones y Consejos de Vida", "icon": "🎉", "relationship": "Soporte Comunitario", "reason": "Conecta la resolución de crisis externas con el apoyo emocional en dilemas personales."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Peticiones de auxilio urgente con 〜てほしい",
                "objective": "Aprender a delegar o solicitar acciones apremiantes a terceras personas en emergencias.",
                "grammar_points": [
                    {
                        "title": "Deseo de acción de otra persona: [Persona に] + Verbo [Forma て] + ほしい",
                        "formula": "[Sujeto ajeno] に + Verbo [Forma て] + ほしい (です / んですが)",
                        "explanation": "Se emplea cuando el hablante desea intensamente que otra persona realice una acción ('necesito que hagas...', 'quiero que vengas').",
                        "usage_notes": "A superiores no se les dice '〜てほしい', sino '〜ていただきたい' o '〜ていただけますでしょうか'.",
                        "examples": [
                            {"jp": "誰か日本語ができる人に通訳してほしいです。", "kana": "だれかにほんごができるひとにつうやくしてほしいです。", "es": "Necesito que alguien que hable japonés me haga de intérprete."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 41", "task": "Pedir auxilio ante emergencias médicas o accidentes", "sample": "救急車を呼んでほしいです。"}
                ],
                "vocab": [
                    {"kanji": "救急車", "kana": "きゅうきゅうしゃ", "meaning": "ambulancia", "type": "Sustantivo"},
                    {"kanji": "警察", "kana": "けいさつ", "meaning": "policía", "type": "Sustantivo"},
                    {"kanji": "落とす", "kana": "おとす", "meaning": "perder / tirar", "type": "Verbo Godan"},
                    {"kanji": "届ける", "kana": "とどける", "meaning": "entregar / reportar", "type": "Verbo Ichidan"}
                ],
                "examples": [
                    {"jp": "危険ですから、すぐにここから離れてほしいです。", "kana": "きけんですから、すぐにここからはなれてほしいです。", "es": "Es peligroso, así que necesito que se alejen de aquí inmediatamente."}
                ]
            },
            {
                "substep": 2,
                "title": "Ciberseguridad y prevención de fraudes",
                "objective": "Reconocer enlaces maliciosos y advertir sobre estafas digitales.",
                "grammar_points": [
                    {
                        "title": "Advertencia y precaución: 〜に注意する / 〜に気をつける",
                        "formula": "Sustantivo に + [十分に] 注意してください / 気をつけてください",
                        "explanation": "Fórmula canónica para prevenir sobre peligros latentes o estafas en curso.",
                        "usage_notes": "Suele reforzarse con adverbios como '絶対に' (bajo ningún concepto).",
                        "examples": [
                            {"jp": "暗証番号を教えるよう求める連絡には、絶対に応じないでください。", "kana": "あんしょうばんごうをおしえるようもとめるれんらくには、ぜったいにおうじないでください。", "es": "Bajo ningún concepto responda a comunicaciones que soliciten su número secreto PIN."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 36", "task": "Identificar fraudes cibernéticos y alertar a otros", "sample": "不審なメールに気をつけてください。"}
                ],
                "vocab": [
                    {"kanji": "詐欺", "kana": "さぎ", "meaning": "estafa", "type": "Sustantivo"},
                    {"kanji": "被害", "kana": "ひがい", "meaning": "daño sufrido", "type": "Sustantivo"},
                    {"kanji": "不審", "kana": "ふしん", "meaning": "sospechoso", "type": "Adjetivo な"},
                    {"kanji": "盗難", "kana": "とうなん", "meaning": "robo", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "身に覚えのない請求が来たら、消費者センターに相談しましょう。", "kana": "みにおぼえのないせいきゅうがきたら、しょうひしゃせんたーにそうだんしましょう。", "es": "Si le llega un cobro que no reconoce, consulte con la oficina del consumidor."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Prevención de Fraudes, Emergencias y Seguridad Ciudadana resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    },

    # =========================================================================
    # MÓDULO 35: RELACIONES INTERPERSONALES, CELEBRACIONES Y CONSEJOS DE VIDA
    # =========================================================================
    {
        "step": 35,
        "title": "Relaciones Interpersonales, Celebraciones y Consejos de Vida",
        "subtitle": "ご結婚おめでとうございます。心からお祝い申し上げます。実は人間関係で悩んでいるんです… (¡Muchas felicidades por su matrimonio! Mis más sinceras felicitaciones. En realidad, estoy preocupado por un dilema personal...)",
        "icon": "🎉",
        "level": "N3",
        "stage": "Módulo 35 · Protocolo Social y Vida Familiar",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Pre-Intermediate (Lecciones 13 y 14, Págs. 169-196)"],
        "sourcePdf": "irodori_pre_intermediate.pdf",
        "detailed_guide": "Las grandes ceremonias vitales en Japón (bodas, nacimientos, convalecencias y funerales, englobadas en el concepto 冠婚葬祭) conllevan una estricta etiqueta de sobres monetarios (祝儀袋), felicitaciones honoríficas y discursos protocolarios. Asimismo, profundizar en la amistad permite confiar preocupaciones íntimas (悩み) y brindar consuelo o sugerencias empáticas mediante 〜たらどうですか.",
        "objectives": [
            "Pronunciar felicitaciones formales en ceremonias nupciales y festejos con お祝い申し上げます.",
            "Confiar inquietudes y pedir consejo en confidencia usando 〜で悩んでいるんです.",
            "Ofrecer sugerencias empáticas y constructivas a amigos afligidos."
        ],
        "can_dos": [
            {"id": "Can-do 44", "task": "Comprender discursos nupciales en banquetes de boda y felicitar a los novios", "sample": "お二人の末永いお幸せを心よりお祈り申し上げます。"},
            {"id": "Can-do 46", "task": "Explicar a un amigo cercano los rasgos y personalidad de seres queridos", "sample": "私にとってかけがえのない親友なんです。"},
            {"id": "Can-do 47", "task": "Consultar a un amigo sobre un dilema interpersonal y escuchar sus consejos", "sample": "同僚との関係で少し悩んでいて、相談に乗ってほしいんです。"}
        ],
        "grammar_focus": [
            "Fórmulas honoríficas de felicitación: 心からお祝い申し上げます / お祈り申し上げます",
            "Expresión de tribulaciones personales: 〜のことで悩んでいる (estar acongojado por)",
            "Sugerencia comprensiva no impositiva: 〜てみたらどうですか / 〜たほうがいいかも"
        ],
        "included_vocab": ["結婚", "お祝い", "悩み", "相談", "親友", "関係", "披露宴", "お祈り"],
        "vocab_details": [
            {"kanji": "結婚", "kana": "けっこん", "romaji": "kekkon", "meaning": "matrimonio / boda", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "お祝い", "kana": "おいわい", "romaji": "oiwai", "meaning": "felicitación / celebración / regalo conmemorativo", "type": "Sustantivo"},
            {"kanji": "悩み", "kana": "なやみ", "romaji": "nayami", "meaning": "preocupación / angustia / dilema", "type": "Sustantivo"},
            {"kanji": "相談", "kana": "そうだん", "romaji": "soudan", "meaning": "consulta / pedir consejo", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "親友", "kana": "しんゆう", "romaji": "shinyuu", "meaning": "mejor amigo / amigo íntimo", "type": "Sustantivo"},
            {"kanji": "披露宴", "kana": "ひろうえん", "romaji": "hirouen", "meaning": "banquete de bodas", "type": "Sustantivo"}
        ],
        "examples": [
            {
                "jp": "新郎新婦のお二人の末永いご多幸を、心よりお祈り申し上げます。",
                "kana": "しんろうしんぷのおふたりのすえながいごたこうを、こころよりおいのりもうしあげます。",
                "romaji": "Shinrou shinpu no ofutari no suenagai gotakou o, kokoro yori oinori moushiagemasu.",
                "es": "Deseo de todo corazón una felicidad eterna y próspera para los recién casados.",
                "explanation": "Fórmula honorífica suprema (お祈り申し上げます) canónica en banquetes nupciales."
            },
            {
                "jp": "一人で抱え込まないで、一度上司に直接相談してみたらどうですか？",
                "kana": "ひとりでかかえこまないで、いちどじょうしにちょくせつそうだんしてみたらどうですか？",
                "romaji": "Hitori de kakaekomanaide, ichido joushi ni chokusetsu soudan shite mitara dou desu ka?",
                "es": "No te guardes todo para ti solo; ¿por qué no pruebas a consultarlo directamente una vez con tu jefe?",
                "explanation": "Sugerencia amable de acción (〜てみたらどうですか) para acompañar a alguien en apuros."
            }
        ],
        "exercises": [
            {
                "id": "m35_ex1",
                "question": "¿Cuál es la expresión canónica de máxima cortesía para felicitar a alguien en un evento solemne?",
                "sentence": "ご昇進、心から (　) 。",
                "options": ["お祝い申し上げます", "お祝いします", "お祝いです", "祝ってあげます"],
                "correct": "お祝い申し上げます",
                "explanation": "お祝い申し上げます es la fórmula de lenguaje humilde (kenjougo) más respetuosa."
            },
            {
                "id": "m35_ex2",
                "question": "¿Cómo aconsejas suavemente '¿por qué no intentas hablar con él?'?",
                "sentence": "彼と一度 (　) どうですか？",
                "options": ["話してみたら", "話すなら", "話したらば", "話しては"],
                "correct": "話してみたら",
                "explanation": "〜てみたらどうですか (¿qué tal si pruebas a...?) sugiere una acción con tacto."
            },
            {
                "id": "m35_ex3",
                "question": "¿Qué palabra significa 'inquietud, tribulación o dilema íntimo'?",
                "sentence": "将来の進路について深い (　) を抱えています。",
                "options": ["悩み", "景色", "切符", "評判"],
                "correct": "悩み",
                "explanation": "悩み (nayami) es una tribulación o dilema que preocupa intensamente."
            },
            {
                "id": "m35_ex4",
                "question": "¿Cómo se llama el banquete de recepción festivo tras la ceremonia nupcial?",
                "sentence": "ホテルの会場で結婚の (　) が行われました。",
                "options": ["披露宴", "避難所", "案内所", "初詣"],
                "correct": "披露宴",
                "explanation": "披露宴 (hirouen) es el banquete nupcial de bodas."
            }
        ],
        "related_topics": [
            {"step": 24, "title": "Tradiciones Anuales, Festividades y Protocolo Social", "icon": "👘", "relationship": "Marco Ceremonial N4", "reason": "De los festivales del calendario se avanza al protocolo de ritos de paso vitales (bodas y conmemoraciones)."},
            {"step": 32, "title": "Convivencia Social, Nuevas Amistades y Reglas de Cortesía", "icon": "🤝", "relationship": "Apertura Emocional", "reason": "Los lazos de amistad entablados permiten ahora confidencias personales y apoyo mutuo."},
            {"step": 37, "title": "Entorno Laboral Japonés, Deberes Profesionales y Keigo Avanzado", "icon": "💼", "relationship": "Keigo Corporativo", "reason": "Prepara la oratoria protocolaria formal que se utilizará en contextos laborales e institucionales."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Protocolo nupcial y felicitaciones honoríficas",
                "objective": "Dominar el léxico y las fórmulas oratorias de felicitación solemne en bodas japonesas.",
                "grammar_points": [
                    {
                        "title": "Felicitación solemne: [Objeto honorífico] + 申し上げます",
                        "formula": "心から [お祝い / お礼 / お詫び] 申し上げます",
                        "explanation": "El verbo 申し上げる es el humilde de 言う (decir). Esta estructura expresa los mejores deseos con una reverencia verbal absoluta.",
                        "usage_notes": "Imprescindible en cartas de salutación formal y discursos de bodas.",
                        "examples": [
                            {"jp": "皆様の温かいご支援に、心より感謝申し上げます。", "kana": "みなさまのあたたかいごしえんに、こころよりかんしゃもうしあげます。", "es": "Expreso de todo corazón mi más sincero agradecimiento por su cálido apoyo."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 44", "task": "Felicitar a los novios en un banquete nupcial", "sample": "心からお祝い申し上げます。"}
                ],
                "vocab": [
                    {"kanji": "結婚", "kana": "けっこん", "meaning": "boda", "type": "Sustantivo verbal"},
                    {"kanji": "お祝い", "kana": "おいわい", "meaning": "felicitación", "type": "Sustantivo"},
                    {"kanji": "披露宴", "kana": "ひろうえん", "meaning": "banquete de boda", "type": "Sustantivo"},
                    {"kanji": "親友", "kana": "しんゆう", "meaning": "amigo íntimo", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "ご結婚おめでとうございます。末永くお幸せに。", "kana": "ごけっこんおめでとうございます。すえながくおしあわせに。", "es": "Felicidades por su boda; sean felices por siempre."}
                ]
            },
            {
                "substep": 2,
                "title": "Confidencias personales y sugerencias empáticas",
                "objective": "Aprender a exteriorizar preocupaciones personales y sugerir salidas constructivas con tacto.",
                "grammar_points": [
                    {
                        "title": "Sugerencia comprensiva: Verbo [Forma て] + みたらどうですか",
                        "formula": "Verbo [Forma て] + みたらどうですか / みてはいかがですか",
                        "explanation": "Propone una alternativa al interlocutor animándole a experimentar una acción sin imponerle una obligación.",
                        "usage_notes": "Si se desea sugerir con todavía mayor suavidad, se concluye con '〜かもね' (tal vez...).",
                        "examples": [
                            {"jp": "少し気分転換に旅行にでも行ってみたらどう？", "kana": "すこしきぶんてんかんにりょこうにでもいってみたらどう？", "es": "¿Por qué no pruebas a irte de viaje para despejar un poco la mente?"}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 47", "task": "Pedir y brindar consejo sobre relaciones personales", "sample": "人間関係で悩んでいるんです。"}
                ],
                "vocab": [
                    {"kanji": "悩み", "kana": "なやみ", "meaning": "preocupación", "type": "Sustantivo"},
                    {"kanji": "相談", "kana": "そうだん", "meaning": "consulta", "type": "Sustantivo verbal"},
                    {"kanji": "関係", "kana": "かんけい", "meaning": "relación / vínculo", "type": "Sustantivo"},
                    {"kanji": "大切", "kana": "たいせつ", "meaning": "importante / preciado", "type": "Adjetivo な"}
                ],
                "examples": [
                    {"jp": "困ったときはいつでも私に相談してくださいね。", "kana": "こまったときはいつでもわたしにそうだんしてくださいね。", "es": "Cuando tengas problemas, consúltame en cualquier momento."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Relaciones Interpersonales, Celebraciones y Consejos de Vida resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    },

    # =========================================================================
    # MÓDULO 36: GEOGRAFÍA JAPONESA, RUTAS HISTÓRICAS Y CRÓNICAS DE VIAJE
    # =========================================================================
    {
        "step": 36,
        "title": "Geografía Japonesa, Rutas Históricas y Crónicas de Viaje",
        "subtitle": "桜島を自分の目で見てみたいんです。いい写真がたくさん撮れました。 (Quiero ver el monte Sakurajima con mis propios ojos. Pude tomar muchísimas fotos buenas.)",
        "icon": "🗾",
        "level": "N3",
        "stage": "Módulo 36 · Exploración Geográfica y Turismo Cultural",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Pre-Intermediate (Lecciones 15 y 16, Págs. 197-224)"],
        "sourcePdf": "irodori_pre_intermediate.pdf",
        "detailed_guide": "Recorrer las 47 prefecturas de Japón requiere una apreciación geográfica de sus regiones (Hokkaido, Tohoku, Kanto, Chubu, Kansai, Chugoku, Shikoku, Kyushu y Okinawa). En este módulo se aprende a manifestar curiosidad experiencial con 〜てみたい (desear experimentar por primera vez), a narrar anécdotas de viaje y a solicitar modificaciones de servicios en hoteles o posadas tradicionales (ryokan) con peticiones elaboradas.",
        "objectives": [
            "Expresar deseos de vivir nuevas vivencias con Verbo [Forma て] + みたい.",
            "Describir atractivos patrimoniales, paisajes volcánicos y castillos feudales japoneses.",
            "Solicitar cambios en servicios de hotel (ej. menús o camas) explicando motivos de forma cortés."
        ],
        "can_dos": [
            {"id": "Can-do 51", "task": "Conversar con detalle sobre destinos turísticos deseados y las actividades que se sueña realizar allí", "sample": "鹿児島に行って、本場の黒豚を食べてみたいです。"},
            {"id": "Can-do 53", "task": "Explicar las circunstancias al personal de un ryokan para solicitar modificaciones en el menú de la cena", "sample": "夕食の内容を少し変更してほしいんですが…"},
            {"id": "Can-do 54", "task": "Relatar anécdotas y experiencias de viaje imprevistas a los amigos", "sample": "飛行機が遅れて1時間以上待たされたんです。"}
        ],
        "grammar_focus": [
            "Deseo de experiencia personal: Verbo [Forma て] + みたい ('quiero probar a hacer')",
            "Voz Pasiva de molestia o afectación: Verbo [Forma Pasiva 受身形] (待たされた / 降られた)",
            "Geografía y provincias de Japón: 地方, 桜島, 史跡, 温泉街, 特産品"
        ],
        "included_vocab": ["桜島", "地方", "名所", "名物", "歴史", "変更", "体験", "景色"],
        "vocab_details": [
            {"kanji": "地方", "kana": "ちほう", "romaji": "chihou", "meaning": "región / provincia / campo", "type": "Sustantivo"},
            {"kanji": "名所", "kana": "めいしょ", "romaji": "meisho", "meaning": "lugar célebre o famoso", "type": "Sustantivo"},
            {"kanji": "名物", "kana": "めいぶつ", "romaji": "meibutsu", "meaning": "producto típico / especialidad local", "type": "Sustantivo"},
            {"kanji": "体験", "kana": "たいけん", "romaji": "taiken", "meaning": "experiencia vivencial en primera persona", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "変更", "kana": "へんこう", "romaji": "henkou", "meaning": "cambio / modificación", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "歴史", "kana": "れきし", "romaji": "rekishi", "meaning": "historia", "type": "Sustantivo"}
        ],
        "examples": [
            {
                "jp": "テレビで見た北海道の広大な雪景色を、いつか自分の目で見てみたいです。",
                "kana": "てれびでみたほっかいどうのこうだいなゆきげしきを、いつかじぶんのめでみてみたいです。",
                "romaji": "Terebi de mita Hokkaidou no koudai na yukigeshiki o, itsuka jibun no me de mite mitai desu.",
                "es": "Algún día me gustaría ver con mis propios ojos el vasto paisaje nevado de Hokkaido que vi en la televisión.",
                "explanation": "Forma て (見て) + みたい expresa la ilusión de comprobar algo por experiencia propia."
            },
            {
                "jp": "大雪で電車が止まってしまい、駅で3時間も待たされました。",
                "kana": "おおゆきででんしゃがとまってしまい、えきで3じかんもまたされました。",
                "romaji": "Ooyuki de densha ga tomatte shimai, eki de sanjikan mo matasaremashita.",
                "es": "El tren se detuvo por la intensa nevada y me hicieron esperar más de 3 horas en la estación.",
                "explanation": "Voz causativo-pasiva (待たされた) que transmite la molestia sufrida involuntariamente."
            }
        ],
        "exercises": [
            {
                "id": "m36_ex1",
                "question": "¿Cómo se dice 'quiero probar a ponerme un kimono'?",
                "sentence": "京都で着物を (　) みたいです。",
                "options": ["着て", "着た", "着る", "着れば"],
                "correct": "着て",
                "explanation": "Forma て (着て) + みたいです = quiero probar a vestir."
            },
            {
                "id": "m36_ex2",
                "question": "¿Qué palabra designa las comidas u objetos característicos y célebres de una comarca japonesa?",
                "sentence": "広島の (　) はお好み焼きともみじ饅頭です。",
                "options": ["名物", "被害", "規則", "苦労"],
                "correct": "名物",
                "explanation": "名物 (meibutsu) es el producto o plato típico representativo de una localidad."
            },
            {
                "id": "m36_ex3",
                "question": "¿Cómo se llama el icónico volcán activo situado frente a la ciudad de Kagoshima en Kyushu?",
                "sentence": "鹿児島湾にそびえる有名な活火山は (　) です。",
                "options": ["桜島", "富士山", "阿蘇山", "高尾山"],
                "correct": "桜島",
                "explanation": "桜島 (Sakurajima) es el célebre volcán de Kagoshima."
            },
            {
                "id": "m36_ex4",
                "question": "¿Qué palabra significa 'solicitar un cambio o modificación' en una reserva?",
                "sentence": "チェックインの時間を (　) したいのですが…",
                "options": ["変更", "案内", "中止", "暗記"],
                "correct": "変更",
                "explanation": "変更 (henkou) significa modificación o alteración de datos."
            }
        ],
        "related_topics": [
            {"step": 17, "title": "Planes Vacacionales, Deseos y Cultura Onsen", "icon": "♨️", "relationship": "Fundamento N5", "reason": "De los primeros viajes balnearios en N5 se evoluciona al conocimiento territorial profundo de las prefecturas en N3."},
            {"step": 22, "title": "Viajes, Reservas y Consejos Turísticos", "icon": "🚅", "relationship": "Precedente N4", "reason": "Complementa la logística del transporte con la narración de experiencias complejas y geografía regional."},
            {"step": 31, "title": "Gastronomía Local, Cocina Casera y Nutrición", "icon": "🍳", "relationship": "Cultura y Sabores", "reason": "Conecta los productos locales (名物) con las tradiciones culinarias autóctonas de cada prefectura."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Deseo de experimentación vivencial con 〜てみたい",
                "objective": "Aprender a proyectar viajes culturales describiendo con emoción las actividades soñadas.",
                "grammar_points": [
                    {
                        "title": "Deseo experimental: Verbo [Forma て] + みたい",
                        "formula": "Verbo [Forma て] + みたい (です / んです)",
                        "explanation": "Expresa el afán o anhelo de comprobar por uno mismo una vivencia desconocida ('me gustaría probar a...').",
                        "usage_notes": "Si es algo que se desea intensamente, suele combinarse con 'ぜひ' (sin falta).",
                        "examples": [
                            {"jp": "沖縄の透き通るような青い海でダイビングをしてみたいです。", "kana": "おきなわのすきとおるようなあおいうみでだいびんぐをしてみたいです。", "es": "Me gustaría probar a hacer buceo en el mar azul transparente de Okinawa."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 51", "task": "Hablar de destinos y planes soñados", "sample": "桜島を見てみたいんです。"}
                ],
                "vocab": [
                    {"kanji": "地方", "kana": "ちほう", "meaning": "región", "type": "Sustantivo"},
                    {"kanji": "名所", "kana": "めいしょ", "meaning": "lugar célebre", "type": "Sustantivo"},
                    {"kanji": "体験", "kana": "たいけん", "meaning": "experiencia vivencial", "type": "Sustantivo verbal"},
                    {"kanji": "景色", "kana": "けしき", "meaning": "paisaje", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "歴史ある城下町の街並みを散策してみたいです。", "kana": "れきしあるじょうかまちのまちなみをさんさくしてみたいです。", "es": "Me gustaría pasear por las calles de una histórica ciudad señorial con castillo."}
                ]
            },
            {
                "substep": 2,
                "title": "Narrativa de anécdotas de viaje y gestión hotelera",
                "objective": "Resolver peticiones de servicios especiales en posadas tradicionales y narrar peripecias imprevistas.",
                "grammar_points": [
                    {
                        "title": "Expresión de contratiempos con la voz pasiva de perjuicio",
                        "formula": "Verbo [Forma Pasiva / Causativo-Pasiva] + てしまった",
                        "explanation": "Se emplea para transmitir el desconcierto o molestia causada por un evento ajeno que afectó al viajero (ej. sufrir retrasos en trenes o verse sorprendido por tormentas).",
                        "usage_notes": "Muy habitual en reseñas turísticas para relatar cómo se sobrellevaron los imprevistos.",
                        "examples": [
                            {"jp": "途中で土砂降りの雨に降られて大変でした。", "kana": "とちゅうでどしゃぶりのあめにふられてたいへんでした。", "es": "Fue duro porque a mitad de camino nos cayó encima una lluvia torrencial."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 53", "task": "Solicitar cambios en servicios hoteleros", "sample": "夕食の内容を変更してほしいんですが…"}
                ],
                "vocab": [
                    {"kanji": "桜島", "kana": "さくらじま", "meaning": "Sakurajima", "type": "Nombre propio"},
                    {"kanji": "名物", "kana": "めいぶつ", "meaning": "especialidad comarcal", "type": "Sustantivo"},
                    {"kanji": "変更", "kana": "へんこう", "meaning": "cambio", "type": "Sustantivo verbal"},
                    {"kanji": "歴史", "kana": "れきし", "meaning": "historia", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "露天風呂付きの部屋にグレードアップしてもらえました。", "kana": "ろてんぶろつきのへやにぐれーどあっぷしてもらえました。", "es": "Pudieron hacernos una mejora a una habitación con baño al aire libre incluido."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Geografía Japonesa, Rutas Históricas y Crónicas de Viaje resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    },

    # =========================================================================
    # MÓDULO 37: ENTORNO LABORAL JAPONÉS, DEBERES PROFESIONALES Y KEIGO AVANZADO
    # =========================================================================
    {
        "step": 37,
        "title": "Entorno Laboral Japonés, Deberes Profesionales y Keigo Avanzado",
        "subtitle": "ホールの仕事について説明します。こちらの部署で働かせていただければ幸いです。 (Les explicaré acerca del trabajo en la sala. Sería un inmenso honor si me permiten trabajar en este departamento.)",
        "icon": "💼",
        "level": "N3",
        "stage": "Módulo 37 · Ámbito Profesional y Comunicación Formal",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Pre-Intermediate (Lecciones 17 y 18, Págs. 225-256)"],
        "sourcePdf": "irodori_pre_intermediate.pdf",
        "detailed_guide": "Este módulo representa la cumbre comunicativa del currículum, preparando al estudiante para insertarse con éxito en el mercado laboral nipón. Se domina la explicación técnica de tareas con 〜について (acerca de / respecto a), las normas estrictas de vestimenta e higiene laboral (身だしなみ規則), la asamblea matutina corporativa (朝礼), y la fórmula magistral de petición humilde para entrevistas de trabajo: Causativo + いただく (働かせていただく).",
        "objectives": [
            "Instruir y describir responsabilidades de puesto usando Sustantivo + について説明する.",
            "Interpretar ofertas de empleo (求人票) y desenvolverse en entrevistas laborales.",
            "Formular peticiones y postulaciones con el Causativo Humilde: Verbo [Causativo て] + いただく."
        ],
        "can_dos": [
            {"id": "Can-do 55", "task": "Explicar las tareas de trabajo y dar instrucciones claras a nuevos compañeros o subalternos", "sample": "作業の手順について順番に説明します。"},
            {"id": "Can-do 61", "task": "Leer fichas de ofertas de empleo (求人情報) evaluando sueldo, jornada y requisitos", "sample": "週休二日制で社会保険が完備された求人です。"},
            {"id": "Can-do 62", "task": "Expresar fortalezas profesionales y motivaciones en una entrevista de trabajo formal", "sample": "これまでの経験を活かして、貴社に貢献したいと考えております。"}
        ],
        "grammar_focus": [
            "Delimitación temática formal: Sustantivo + について (の / は)",
            "Petición de autorización con cortesía suprema: Verbo [Causativo Forma て] + いただければ幸いです",
            "Cultura corporativa japonesa: ほうれんそう (報告・連絡・相談), 朝礼, 身だしなみ"
        ],
        "included_vocab": ["求人", "面接", "履歴書", "担当", "手順", "指示", "貢献", "規則"],
        "vocab_details": [
            {"kanji": "求人", "kana": "きゅうじん", "romaji": "kyuujin", "meaning": "oferta de empleo / búsqueda de personal", "type": "Sustantivo"},
            {"kanji": "面接", "kana": "めんせつ", "romaji": "mensetsu", "meaning": "entrevista formal de trabajo", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "履歴書", "kana": "りれきしょ", "romaji": "rirekisho", "meaning": "currículum vitae / hoja de vida", "type": "Sustantivo"},
            {"kanji": "担当", "kana": "たんとう", "romaji": "tantou", "meaning": "estar a cargo / responsabilidad", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "手順", "kana": "てじゅん", "romaji": "tejun", "meaning": "procedimiento / orden de pasos", "type": "Sustantivo"},
            {"kanji": "貢献", "kana": "こうけん", "romaji": "kouken", "meaning": "contribución / aportar valor", "type": "Sustantivo verbal (Suru)"}
        ],
        "examples": [
            {
                "jp": "本日の業務手順について、こちらのマニュアルに沿ってご説明いたします。",
                "kana": "ほんじつのぎょうむてじゅんについて、こちらのまにゅあるにそってごせつめいいいたします。",
                "romaji": "Honjitsu no gyoumu tejun ni tsuite, kochira no manyuaru ni sotte gosetsumei itashimasu.",
                "es": "Acerca del procedimiento de trabajo del día de hoy, procederé a explicárselo siguiendo este manual.",
                "explanation": "Sustantivo + について unida al lenguaje honorífico humilde (ご説明いたします)."
            },
            {
                "jp": "これまでの接客経験を活かし、ぜひ貴店で働かせていただければ幸いです。",
                "kana": "これまでのせっきゃくけいけんをいかし、ぜひきてんではたらかせていただければさいわいです。",
                "romaji": "Kore made no sekkyaku keiken o ikashi, zehi kiten de hatarakasete itadakereba saiwai desu.",
                "es": "Aprovechando mi experiencia previa en atención al cliente, sería un inmenso honor si me permitiesen trabajar en su distinguido establecimiento.",
                "explanation": "働かせる (hacer/permitir trabajar, causativo) + いただければ幸いです es la cúspide de la humildad en entrevistas laborales."
            }
        ],
        "exercises": [
            {
                "id": "m37_ex1",
                "question": "¿Qué estructura significa 'acerca de / respecto al trabajo'?",
                "sentence": "今後のスケジュール (　) 話し合いましょう。",
                "options": ["について", "にとって", "に対して", "において"],
                "correct": "について",
                "explanation": "〜について significa 'acerca de / sobre el tema de'."
            },
            {
                "id": "m37_ex2",
                "question": "¿Cómo se solicita formalmente 'permítame trabajar aquí' con la forma causativa humilde?",
                "sentence": "ぜひこちらの会社で (　) いただければ幸いです。",
                "options": ["働かせて", "働いて", "働かれて", "働かないで"],
                "correct": "働かせて",
                "explanation": "働かせる (causativo: permitir trabajar) en forma て (働かせて) + いただく."
            },
            {
                "id": "m37_ex3",
                "question": "¿Qué documento oficial con tus datos formativos y laborales entregas en una entrevista de trabajo en Japón?",
                "sentence": "写真付きの (　) を提出してください。",
                "options": ["履歴書", "不在票", "定期券", "案内書"],
                "correct": "履歴書",
                "explanation": "履歴書 (rirekisho) es el currículum vitae oficial japonés."
            },
            {
                "id": "m37_ex4",
                "question": "¿Cómo se llama el principio corporativo japonés de 'informar, comunicar y consultar'?",
                "sentence": "職場の円滑な連携には (　) が欠かせません。",
                "options": ["ほうれんそう", "おせち", "初詣", "屋台"],
                "correct": "ほうれんそう",
                "explanation": "ほうれんそう acrónimo de 報告 (houkoku), 連絡 (renraku) y 相談 (soudan)."
            }
        ],
        "related_topics": [
            {"step": 9, "title": "Instrucciones de Trabajo, Peticiones y Reglas Laborales", "icon": "📋", "relationship": "Fundamento N5", "reason": "De seguir órdenes elementales en N5 se culmina en dar instrucciones complejas y postularse profesionalmente en N3."},
            {"step": 28, "title": "Proyección Vital, Logros y Emprendimiento", "icon": "🚀", "relationship": "Precedente N4", "reason": "Conecta la ambición de emprender con las herramientas del protocolo corporativo formal."},
            {"step": 33, "title": "Metacognición Lingüística y Métodos de Aprendizaje", "icon": "📚", "relationship": "Fortalezas Personales", "reason": "Permite articular con fluidez las competencias personales y lingüísticas en entrevistas formales de trabajo."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Delimitación y explicación de tareas: 〜について",
                "objective": "Aprender a instruir a compañeros y desglosar procedimientos de trabajo con claridad técnica.",
                "grammar_points": [
                    {
                        "title": "Tema formal delimitado: Sustantivo + について",
                        "formula": "Sustantivo + について (説明する / 報告する / 考える) / Modificador: についての + Sustantivo",
                        "explanation": "Delimita el tema o materia objeto de análisis, discurso o reflexión formal ('en torno a...', 'con respecto a...').",
                        "usage_notes": "Es imprescindible en reuniones de trabajo (会議), informes escritos y exposiciones.",
                        "examples": [
                            {"jp": "来期の事業計画について、皆様のご意見を伺いたいと思います。", "kana": "らいきのじぎょうけいかくについて、みなさまのごいけんをうかがいたいとおもいます。", "es": "Respecto al plan de negocio del próximo periodo, desearía escuchar sus respetables opiniones."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 55", "task": "Explicar tareas y procedimientos a subordinados o compañeros", "sample": "仕事について説明します。"}
                ],
                "vocab": [
                    {"kanji": "担当", "kana": "たんとう", "meaning": "responsable / a cargo", "type": "Sustantivo verbal"},
                    {"kanji": "手順", "kana": "てじゅん", "meaning": "procedimiento", "type": "Sustantivo"},
                    {"kanji": "指示", "kana": "しじ", "meaning": "instrucción", "type": "Sustantivo verbal"},
                    {"kanji": "規則", "kana": "きそく", "meaning": "normativa laboral", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "安全衛生規則について、しっかり確認しておいてください。", "kana": "あんぜんえいせいきそくについて、しっかりかくにんしておいてください。", "es": "Por favor, asegúrese de revisar a fondo las normas de seguridad e higiene."}
                ]
            },
            {
                "substep": 2,
                "title": "Postulación laboral y el Causativo Humilde: 〜させていただければ",
                "objective": "Defender tu valía en entrevistas de trabajo utilizando la máxima deferencia hacia la empresa.",
                "grammar_points": [
                    {
                        "title": "Petición de permiso con beneficio propio: Verbo [Causativo Forma て] + いただく",
                        "formula": "Verbo [Causativo Forma て] + いただければ幸いです / いただきます",
                        "explanation": "El causativo (hacer que alguien haga) combinado con いただく (recibir respetuosamente) significa literalmente 'recibir el favor de que ustedes me permitan realizar la acción'. Es el estándar supremo de cortesía al pedir que te contraten o te concedan la palabra.",
                        "usage_notes": "En entrevistas: '自己紹介をさせていただきます' (permítanme presentarme).",
                        "examples": [
                            {"jp": "これまでの経験を活かし、貴社の発展に貢献させていただければ幸いです。", "kana": "これまでのけいけんをいかし、きしゃのはってんにこうけんさせていただければさいわいです。", "es": "Aprovechando mi experiencia previa, sería un gran honor si me permiten contribuir al desarrollo de su distinguida empresa."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 62", "task": "Expresar capacidades y deseos en entrevistas de trabajo", "sample": "働かせていただければ幸いです。"}
                ],
                "vocab": [
                    {"kanji": "求人", "kana": "きゅうじん", "meaning": "oferta de empleo", "type": "Sustantivo"},
                    {"kanji": "面接", "kana": "めんせつ", "meaning": "entrevista laboral", "type": "Sustantivo verbal"},
                    {"kanji": "履歴書", "kana": "りれきしょ", "meaning": "currículum vitae", "type": "Sustantivo"},
                    {"kanji": "貢献", "kana": "こうけん", "meaning": "contribución", "type": "Sustantivo verbal"}
                ],
                "examples": [
                    {"jp": "本日は面接の機会をいただき、誠にありがとうございます。", "kana": "ほんじつはめんせつのきかいをいただき、まことにありがとうございます。", "es": "Muchas gracias sinceramente por brindarme la oportunidad de esta entrevista el día de hoy."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Entorno Laboral Japonés, Deberes Profesionales y Keigo Avanzado resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    }
]

MODULES_29_TO_37.extend(MODULES_31_TO_37)
print(f"Total módulos en generate_preint_modules_29_to_37: {len(MODULES_29_TO_37)} (M29 a M37)")
