# Modulos 23 a 28 (Elementary 2 -> N4)
MODULES_23_TO_28 = [
    # M23
    {
        "step": 23,
        "title": "Eventos Comunitarios, Festivales y Condiciones",
        "subtitle": "雨が降ったらどうしますか？屋台がどこにあるか知っていますか？ (¿Qué haremos si llueve? ¿Sabes dónde están los puestos callejeros?)",
        "icon": "🏮",
        "level": "N4",
        "stage": "Módulo 23 · Comunidad y Festividades",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Elementary 2 (Lecciones 7 y 8, Págs. 85-112)"],
        "sourcePdf": "irodori_elementary_2.pdf",
        "detailed_guide": "Los festivales locales (matsuri) y eventos vecinales en Japón fomentan la integración comunitaria. En este módulo se domina la estructura condicional universal 〜たら (si ocurre X / cuando ocurra X) para anticipar contingencias climáticas (como lluvia o tifones), y las oraciones interrogativas incrustadas (Interrogativo + か) para consultar ubicaciones y horarios sin sonar brusco.",
        "objectives": [
            "Formular hipótesis y contingencias condicionales con 〜たら.",
            "Incrustar preguntas indirectas en oraciones complejas con [疑問詞] + か.",
            "Participar en actividades cívicas de voluntariado y festivales de barrio."
        ],
        "can_dos": [
            {"id": "Can-do 28", "task": "Preguntar y responder qué hacer si surgen imprevistos como lluvia en eventos", "sample": "雨が降ったら、体育館で行います。"},
            {"id": "Can-do 32", "task": "Preguntar a los organizadores dónde se ubican puestos y servicios", "sample": "屋台がどこにあるか、教えてもらえますか？"},
            {"id": "Can-do 35", "task": "Comprender anuncios sobre normas de seguridad en festivales de fuegos artificiales", "sample": "花火大会の会場では走らないでください。"}
        ],
        "grammar_focus": [
            "Condicional hipotético y temporal: Verbo [Forma た] + ら ('si / cuando')",
            "Pregunta indirecta incrustada: [Palabra interrogativa] + か + 知っている / 分かる",
            "Sustantivación de acciones para eventos: [Verbo Diccionario] + ことになっています"
        ],
        "included_vocab": ["祭り", "屋台", "花火", "体育館", "中止", "案内所", "参加", "ボランティア"],
        "vocab_details": [
            {"kanji": "祭り", "kana": "まつり", "romaji": "matsuri", "meaning": "festival tradicional", "type": "Sustantivo"},
            {"kanji": "屋台", "kana": "やたい", "romaji": "yatai", "meaning": "puesto callejero de comida o juegos", "type": "Sustantivo"},
            {"kanji": "花火", "kana": "はなび", "romaji": "hanabi", "meaning": "fuegos artificiales", "type": "Sustantivo"},
            {"kanji": "中止", "kana": "ちゅうし", "romaji": "chuushi", "meaning": "cancelación / suspensión", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "参加", "kana": "さんか", "romaji": "sanka", "meaning": "participación", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "体育館", "kana": "たいいくかん", "romaji": "taiikukan", "meaning": "gimnasio / pabellón cubierto", "type": "Sustantivo"}
        ],
        "examples": [
            {
                "jp": "もし明日雨が降ったら、お祭りは中止になりますか？",
                "kana": "もしあしたあめがふったら、おまつりはちゅうしになりますか？",
                "romaji": "Moshi ashita ame ga futtara, omatsuri wa chuushi ni narimasu ka?",
                "es": "Si mañana lloviera, ¿se cancelará el festival?",
                "explanation": "Uso de 'もし' junto al condicional 〜たら para enfatizar la hipótesis futura."
            },
            {
                "jp": "救護所がどこにあるか、知っていますか？",
                "kana": "きゅうごじょがどこにあるか、しっていますか？",
                "romaji": "Kyuugojo ga doko ni aru ka, shitte imasu ka?",
                "es": "¿Sabe usted dónde está el puesto de primeros auxilios?",
                "explanation": "Pregunta indirecta con どこにある + か seguida del verbo principal 知っていますか."
            }
        ],
        "exercises": [
            {
                "id": "m23_ex1",
                "question": "¿Cómo se dice 'si tienes tiempo' con la estructura condicional たら?",
                "sentence": "時間が (　) 、一緒にお祭りに行きませんか？",
                "options": ["あったら", "あると", "あれば", "あるなら"],
                "correct": "あったら",
                "explanation": "Forma た (あった) + ら = あったら (si hay / si tienes)."
            },
            {
                "id": "m23_ex2",
                "question": "¿Cuál es la partícula para incrustar 'a qué hora empieza' en 'no sé a qué hora empieza'?",
                "sentence": "何時に始まる (　) わかりません。",
                "options": ["か", "が", "を", "に"],
                "correct": "か",
                "explanation": "Las preguntas indirectas con pronombre interrogativo se cierran con la partícula か."
            },
            {
                "id": "m23_ex3",
                "question": "¿Qué palabra significa 'cancelación o suspensión' de un evento?",
                "sentence": "台風のため、盆踊りは (　) になりました。",
                "options": ["中止", "参加", "出発", "予約"],
                "correct": "中止",
                "explanation": "中止 (chuushi) significa suspensión o cancelación."
            },
            {
                "id": "m23_ex4",
                "question": "¿Cómo se llaman los puestos callejeros típicos de festivales japoneses?",
                "sentence": "お祭りの (　) でたこ焼きを買いました。",
                "options": ["屋台", "交番", "病院", "薬局"],
                "correct": "屋台",
                "explanation": "屋台 (yatai) son los puestos ambulantes de comida en festivales."
            }
        ],
        "related_topics": [
            {"step": 11, "title": "Eventos, Festivales, Invitaciones y Propuestas", "icon": "🎆", "relationship": "Fundamento N5", "reason": "De la invitación informal básica en N5 se pasa a la coordinación logística comunitaria y condiciones en N4."},
            {"step": 24, "title": "Tradiciones Anuales, Festividades y Protocolo Social", "icon": "👘", "relationship": "Consecutivo Natural", "reason": "Conecta los festivales vecinales con las celebraciones rituales del calendario anual y el protocolo de vestimenta."},
            {"step": 27, "title": "Medio Ambiente, Prevención de Desastres y Sismos", "icon": "🚨", "relationship": "Seguridad y Contingencia", "reason": "Ambos módulos abordan la gestión de contingencias meteorológicas y protocolos de seguridad comunitaria."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Condiciones e imprevistos con 〜たら",
                "objective": "Aprender a prever contingencias y alternativas para eventos al aire libre.",
                "grammar_points": [
                    {
                        "title": "Condicional general: Verbo/Adjetivo [Forma た] + ら",
                        "formula": "Verbo [Forma た] + ら / Adj-い [かった] + ら / Sustantivo/Adj-な + だったら",
                        "explanation": "Indica una condición hipotética o una secuencia temporal ineludible ('cuando ocurra X, entonces Y'). Es la forma condicional más versátil y coloquial del idioma japonés.",
                        "usage_notes": "A menudo se introduce con もし al principio para recalcar que se trata de una suposición.",
                        "examples": [
                            {"jp": "雨が降ったら、イベントは屋内でやります。", "kana": "あめがふったら、いべんとはおくないでやります。", "es": "Si llueve, el evento se hará en interiores."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 28", "task": "Preguntar y responder sobre contingencias por lluvia", "sample": "雨が降ったら、体育館で行います。"}
                ],
                "vocab": [
                    {"kanji": "祭り", "kana": "まつり", "meaning": "festival", "type": "Sustantivo"},
                    {"kanji": "中止", "kana": "ちゅうし", "meaning": "cancelación", "type": "Sustantivo verbal"},
                    {"kanji": "花火", "kana": "はなび", "meaning": "fuegos artificiales", "type": "Sustantivo"},
                    {"kanji": "体育館", "kana": "たいいくかん", "meaning": "gimnasio", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "天気が悪かったら、来週に延期します。", "kana": "てんきがわるかったら、らいしゅうにえんきします。", "es": "Si el tiempo empeora, se pospondrá para la próxima semana."}
                ]
            },
            {
                "substep": 2,
                "title": "Preguntas indirectas en oraciones compuestas con 〜か",
                "objective": "Indagar sobre ubicaciones, programas y horarios incrustando preguntas dentro de la frase.",
                "grammar_points": [
                    {
                        "title": "Pregunta indirecta: Cláusula interrogativa + か",
                        "formula": "[Palabra interrogativa + Forma informal] + か + 確かめる / 調べる / 聞く",
                        "explanation": "Permite formular oraciones como 'verifiquemos a qué hora empieza' o 'no sé quién vendrá' sin usar signos interrogativos directos.",
                        "usage_notes": "Si no contiene palabra interrogativa y es de sí/no, se formula como [Forma informal] + かどうか.",
                        "examples": [
                            {"jp": "屋台が何時に閉まるか、係員に聞いてみます。", "kana": "やたいがなんじにしまるか、かかりいんにきいてみます。", "es": "Le preguntaré al encargado a qué hora cierran los puestos."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 32", "task": "Preguntar dónde se sitúan los puestos en un recinto", "sample": "屋台がどこにあるか知っていますか？"}
                ],
                "vocab": [
                    {"kanji": "屋台", "kana": "やたい", "meaning": "puesto callejero", "type": "Sustantivo"},
                    {"kanji": "参加", "kana": "さんか", "meaning": "participación", "type": "Sustantivo verbal"},
                    {"kanji": "案内所", "kana": "あんないじょ", "meaning": "centro de información", "type": "Sustantivo"},
                    {"kanji": "ボランティア", "kana": "ぼらんてぃあ", "meaning": "voluntariado", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "ごみ箱がどこにあるか分かりますか？", "kana": "ごみばこがどこにあるかわかりますか？", "es": "¿Sabe dónde está la papelera?"}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Eventos Comunitarios, Festivales y Condiciones resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    },

    # M24
    {
        "step": 24,
        "title": "Tradiciones Anuales, Festividades y Protocolo Social",
        "subtitle": "どんな服を着ていったらいいですか？成人式にはきれいな着物を着ます。 (¿Qué ropa debería llevar puesta? En la Ceremonia de la Mayoría de Edad se viste un hermoso kimono.)",
        "icon": "👘",
        "level": "N4",
        "stage": "Módulo 24 · Cultura y Tradiciones",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Elementary 2 (Lecciones 9 y 10, Págs. 113-140)"],
        "sourcePdf": "irodori_elementary_2.pdf",
        "detailed_guide": "El ciclo del año japonés (年中行事) está marcado por ceremonias ancestrales: Año Nuevo (お正月), Setsubun, Hina Matsuri, Obon y el Día de la Mayoría de Edad (成人式). Participar en estos ritos requiere solicitar orientación sobre vestimenta y etiqueta mediante la fórmula interrogativa de recomendación 〜たらいいですか, así como dominar el vocabulario indumentario y de protocolos festivos.",
        "objectives": [
            "Pedir consejo sobre etiqueta, regalos o vestimenta con 〜たらいいですか.",
            "Describir la indumentaria tradicional y occidental con verbos específicos de vestimenta (着る, 履く, かぶる).",
            "Comprender las fechas clave del calendario cultural japonés y sus comidas alegóricas."
        ],
        "can_dos": [
            {"id": "Can-do 37", "task": "Preguntar qué tipo de atuendo o regalo es apropiado llevar a un festejo formal", "sample": "どんな服を着ていったらいいですか？"},
            {"id": "Can-do 40", "task": "Explicar a amigos extranjeros las costumbres del Año Nuevo o ceremonias japonesas", "sample": "お正月には家族とおせち料理を食べます。"},
            {"id": "Can-do 44", "task": "Leer folletos ilustrados sobre ritos estacionales y fechas conmemorativas", "sample": "成人式は20歳になった若者を祝う日です。"}
        ],
        "grammar_focus": [
            "Petición de asesoramiento: [Interrogativo] + Verbo [Forma たら] + いいですか ('¿Qué debería hacer?')",
            "Verbos de indumentaria según la zona corporal: 着る (torso), 履く (piernas/pies), かぶる (cabeza), かける (gafas)",
            "Tradiciones estacionales: おせち料理, 初詣, 着物, 袴"
        ],
        "included_vocab": ["正月", "成人式", "着物", "スーツ", "初詣", "神社", "おせち", "祝う"],
        "vocab_details": [
            {"kanji": "正月", "kana": "しょうがつ", "romaji": "shougatsu", "meaning": "Año Nuevo japonés", "type": "Sustantivo"},
            {"kanji": "成人式", "kana": "せいじんしき", "romaji": "seijinshiki", "meaning": "Ceremonia de la Mayoría de Edad", "type": "Sustantivo"},
            {"kanji": "着物", "kana": "きもの", "romaji": "kimono", "meaning": "kimono (traje tradicional)", "type": "Sustantivo"},
            {"kanji": "神社", "kana": "じんじゃ", "romaji": "jinja", "meaning": "santuario sintoísta", "type": "Sustantivo"},
            {"kanji": "祝う", "kana": "いわう", "romaji": "iwau", "meaning": "celebrar / felicitar", "type": "Verbo Godan"},
            {"kanji": "初詣", "kana": "はつもうで", "romaji": "hatsumoude", "meaning": "primera visita del año al santuario", "type": "Sustantivo verbal (Suru)"}
        ],
        "examples": [
            {
                "jp": "友人の結婚式に招待されたのですが、どんな服を着ていったらいいですか？",
                "kana": "ゆうじんのけっこんしきにしょうたいされたのですが、どんなふくをきていったらいいですか？",
                "romaji": "Yuujin no kekkonshiki ni shoutai sareta no desu ga, donna fuku o kite ittara ii desu ka?",
                "es": "He sido invitado a la boda de un amigo; ¿qué clase de ropa debería llevar puesta?",
                "explanation": "Forma たら + いいですか solicita la mejor recomendación de protocolo."
            },
            {
                "jp": "日本では、お正月の三が日に神社やお寺へ初詣に行きます。",
                "kana": "にほんでは、おしょうがつのさんがにちにじんじゃやおてらへはつもうでにいきます。",
                "romaji": "Nihon de wa, oshougatsu no sanganichi ni jinja ya otera e hatsumoude ni ikimasu.",
                "es": "En Japón, la gente va a santuarios o templos a hacer la primera visita del año durante los tres primeros días de Año Nuevo.",
                "explanation": "初詣に行きます expresa el propósito del desplazamiento tradicional."
            }
        ],
        "exercises": [
            {
                "id": "m24_ex1",
                "question": "¿Cómo se pregunta '¿Qué debería comprar?' a un compañero?",
                "sentence": "お土産は何を (　) いいですか？",
                "options": ["買ったら", "買うと", "買えば", "買って"],
                "correct": "買ったら",
                "explanation": "La fórmula canónica para pedir sugerencias o consejos es 〜たらいいですか."
            },
            {
                "id": "m24_ex2",
                "question": "¿Qué verbo japonés se utiliza para colocarse un sombrero o gorro en la cabeza?",
                "sentence": "帽子を (　) 。",
                "options": ["かぶります", "着ます", "履きます", "かけます"],
                "correct": "かぶります",
                "explanation": "かぶる se utiliza exclusivamente para prendas que cubren la cabeza (gorros, sombreros, cascos)."
            },
            {
                "id": "m24_ex3",
                "question": "¿Cómo se llama la primera visita a un santuario en Año Nuevo?",
                "sentence": "元旦に神社へ (　) に行きました。",
                "options": ["初詣", "花火", "紅葉", "花見"],
                "correct": "初詣",
                "explanation": "初詣 (hatsumoude) es la primera oración o visita espiritual de Año Nuevo."
            },
            {
                "id": "m24_ex4",
                "question": "¿Qué verbo se utiliza para ponerse zapatos o pantalones?",
                "sentence": "新しい靴を (　) 。",
                "options": ["履きます", "着ます", "します", "つけます"],
                "correct": "履きます",
                "explanation": "履く (haku) se usa para prendas de cintura para abajo (pantalones, faldas, calzado)."
            }
        ],
        "related_topics": [
            {"step": 10, "title": "Aficiones, Tiempo Libre, Ocio y Redes Sociales", "icon": "📸", "relationship": "Expansión Cultural", "reason": "De actividades recreativas en N5 se profundiza en las celebraciones tradicionales del año japonés."},
            {"step": 23, "title": "Eventos Comunitarios, Festivales y Condiciones", "icon": "🏮", "relationship": "Marco Precedente", "reason": "Conecta la participación en festivales populares con las ceremonias solemnes y familiares."},
            {"step": 35, "title": "Relaciones Interpersonales, Celebraciones y Consejos de Vida", "icon": "🎉", "relationship": "Proyección N3", "reason": "Prepara el dominio de ceremonias nupciales, homenajes y ritos vitales complejos (冠婚葬祭)."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Petición de asesoramiento protocolario con 〜たらいいですか",
                "objective": "Aprender a consultar a nativos sobre las costumbres y normas adecuadas para asistir a eventos formales.",
                "grammar_points": [
                    {
                        "title": "Consulta de recomendaciones: [Interrogativo] + Verbo [Forma たら] + いいですか",
                        "formula": "疑問詞 (どう / 何を / どこに) + Verbo [Forma た] + らいいですか",
                        "explanation": "Se emplea para pedir orientación práctica cuando el hablante desconoce la mejor manera de proceder ante una situación social desconocida.",
                        "usage_notes": "Suele introducirse cortesmente con '〜んですが' (ej. 結婚式に行くんですが、何を...) para brindar contexto previo.",
                        "examples": [
                            {"jp": "初めてお寺に行くのですが、お参りはどうしたらいいですか？", "kana": "はじめておてらにいくのですが、おまいりはどうしたらいいですか？", "es": "Es la primera vez que voy a un templo; ¿cómo debería hacer la oración?"}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 37", "task": "Preguntar qué atuendo o regalo es apropiado", "sample": "どんな服を着ていったらいいですか？"}
                ],
                "vocab": [
                    {"kanji": "着物", "kana": "きもの", "meaning": "kimono", "type": "Sustantivo"},
                    {"kanji": "スーツ", "kana": "すーつ", "meaning": "traje occidental formal", "type": "Sustantivo"},
                    {"kanji": "祝う", "kana": "いわう", "meaning": "celebrar", "type": "Verbo Godan"},
                    {"kanji": "成人式", "kana": "せいじんしき", "meaning": "Ceremonia de Mayoría de Edad", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "どんなネクタイを締めていったらいいですか？", "kana": "どんなねくたいをしめていったらいいですか？", "es": "¿Qué tipo de corbata debería llevar puesta?"}
                ]
            },
            {
                "substep": 2,
                "title": "Verbos de vestimenta y ritos de Año Nuevo",
                "objective": "Diferenciar con precisión los verbos según la parte del cuerpo donde se viste una prenda y describir las tradiciones de Año Nuevo.",
                "grammar_points": [
                    {
                        "title": "Sintaxis de vestimenta corporal en japonés",
                        "formula": "Prenda superior: 着る / Prenda inferior o calzado: 履く / Cabeza: かぶる / Accesorios: つける・する",
                        "explanation": "En japonés no existe un único verbo genérico para 'vestir'. Se selecciona según la anatomía: 着る (camisas, kimonos, abrigos), 履く (pantalones, calcetines, zapatos), かぶる (sombreros, cascos), かける (gafas), 巻く (bufandas), する (reloj, corbata).",
                        "usage_notes": "El estado de 'llevar puesto' se expresa en presente continuo: 〜を着ています.",
                        "examples": [
                            {"jp": "成人の日には、女性は美しい振袖を着ます。", "kana": "せいじんのひには、じょせいはうつくしいふりそでをきます。", "es": "En el Día de la Mayoría de Edad, las mujeres visten hermosos kimonos de manga larga (furisode)."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 40", "task": "Explicar tradiciones de Año Nuevo a foráneos", "sample": "おせち料理を食べて初詣に行きます。"}
                ],
                "vocab": [
                    {"kanji": "正月", "kana": "しょうがつ", "meaning": "Año Nuevo", "type": "Sustantivo"},
                    {"kanji": "神社", "kana": "じんじゃ", "meaning": "santuario", "type": "Sustantivo"},
                    {"kanji": "初詣", "kana": "はつもうで", "meaning": "primera visita al templo", "type": "Sustantivo verbal"},
                    {"kanji": "おせち", "kana": "おせち", "meaning": "comida tradicional de Año Nuevo", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "暖かい手袋をはめて出かけましょう。", "kana": "あたたかいてぶくろをはめてでかけましょう。", "es": "Pongámonos guantes abrigados y salgamos."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Tradiciones Anuales, Festividades y Protocolo Social resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    }
]
print("Bloque 23 y 24 generado correctamente.")
