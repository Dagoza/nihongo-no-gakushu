#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador modular de especificaciones para M20-M37.
Contiene la base de datos pedagógica exhaustiva para Irodori Elementary 2 y Pre-Intermediate.
"""

def get_all_new_modules():
    modules = []

    # Importamos o definimos los módulos
    from generate_modules_23_to_28 import MODULES_23_TO_28
    
    # M20, M21, M22
    from append_irodori_e2_preint_modules import MODULES_DATA
    modules.extend(MODULES_DATA)
    modules.extend(MODULES_23_TO_28)

    # Ahora agregamos M25 a M28
    modules_25_to_28 = [
        # M25
        {
            "step": 25,
            "title": "Compras Inteligentes, Puntos y Ventajas de Consumo",
            "subtitle": "この掃除機は軽くて動かしやすいですよ。ポイントカードを出すのを忘れました。 (Esta aspiradora es ligera y fácil de mover. Olvidé mostrar la tarjeta de puntos.)",
            "icon": "🛒",
            "level": "N4",
            "stage": "Módulo 25 · Consumo y Electrodomésticos",
            "track": "consolidated",
            "track_label": "Módulo Consolidado",
            "sourceBooks": ["Irodori Elementary 2 (Lecciones 11 y 12, Págs. 141-168)"],
            "sourcePdf": "irodori_elementary_2.pdf",
            "detailed_guide": "Comprar con criterio en grandes almacenes de electrónica (Yodobashi, Bic Camera) o mercadillos de segunda mano (Mercari) requiere comparar prestaciones técnicas mediante los sufijos 〜やすい (fácil de hacer) y 〜にくい (difícil de hacer). Además, se aprende a gestionar descuidos habituales con la sustantivación verbal 〜のを忘れました (olvidé hacer...) y a solicitar descuentos en tienda.",
            "objectives": [
                "Describir la facilidad o dificultad de uso de productos con 〜やすい y 〜にくい.",
                "Expresar olvidos y descuidos cotidianos usando [Verbo Diccionario] + のを忘れました.",
                "Interpretar tablas comparativas de especificaciones técnicas y negociar ofertas."
            ],
            "can_dos": [
                {"id": "Can-do 51", "task": "Consultar a conocidos dónde adquirir electrodomésticos eficientes y a buen precio", "sample": "どこで買ったら安くなりますか？"},
                {"id": "Can-do 53", "task": "Comprender tablas comparativas de prestaciones en tiendas de electrónica", "sample": "軽くて音が静かなモデルがおすすめです。"},
                {"id": "Can-do 54", "task": "Preguntar al dependiente si es posible obtener un descuento en tienda", "sample": "これ、少し安くなりますか？"}
            ],
            "grammar_focus": [
                "Facilidad / Dificultad operativa: Verbo [Raíz ます] + やすい / にくい",
                "Sustantivación de acciones olvidadas: Verbo [Forma Diccionario] + のを忘れました",
                "Petición de rebajas o ajustes de precio: 安くしてもらえますか"
            ],
            "included_vocab": ["掃除機", "動かす", "軽い", "重い", "忘れる", "割引", "性能", "アプリ"],
            "vocab_details": [
                {"kanji": "掃除機", "kana": "そうじき", "romaji": "soujiki", "meaning": "aspiradora", "type": "Sustantivo"},
                {"kanji": "動かす", "kana": "うごかす", "romaji": "ugokasu", "meaning": "mover / accionar", "type": "Verbo Godan"},
                {"kanji": "軽い", "kana": "かるい", "romaji": "karui", "meaning": "ligero / poco pesado", "type": "Adjetivo い"},
                {"kanji": "重い", "kana": "おもい", "romaji": "omoi", "meaning": "pesado", "type": "Adjetivo い"},
                {"kanji": "忘れる", "kana": "わすれる", "romaji": "wasureru", "meaning": "olvidar", "type": "Verbo Ichidan"},
                {"kanji": "割引", "kana": "わりびき", "romaji": "waribiki", "meaning": "descuento / rebaja", "type": "Sustantivo"}
            ],
            "examples": [
                {
                    "jp": "このフライパンは軽くて洗いやすいので、毎日重宝しています。",
                    "kana": "このふらいぱんはかるくてあらいやすいので、まいにちちょうほうしています。",
                    "romaji": "Kono furaipan wa karukute araiyasui node, mainichi chouhou shite imasu.",
                    "es": "Como esta sartén es ligera y fácil de lavar, me resulta sumamente útil todos los días.",
                    "explanation": "洗う (lavar) en raíz ます (洗い) + やすい = 洗いやすい (fácil de lavar)."
                },
                {
                    "jp": "会計の時に、ポイントカードを提示するのを忘れました。",
                    "kana": "かいけいのときに、ぽいんとかーどをていじするのをわすれました。",
                    "romaji": "Kaikei no toki ni, pointo kaado o teiji suru no o wasuremashita.",
                    "es": "A la hora de pagar, olvidé presentar la tarjeta de fidelización por puntos.",
                    "explanation": "El verbo se sustantiva con の y recibe la partícula を para indicar qué acción fue olvidada."
                }
            ],
            "exercises": [
                {
                    "id": "m25_ex1",
                    "question": "¿Cómo se indica que una letra es 'fácil de leer'?",
                    "sentence": "この字は大きくてとても (　) です。",
                    "options": ["読みやすい", "読みにくい", "読むやすい", "読んだやすい"],
                    "correct": "読みやすい",
                    "explanation": "Raíz ます (読み) + やすい = 読みやすい (fácil de leer)."
                },
                {
                    "id": "m25_ex2",
                    "question": "¿Cómo se dice 'difícil de usar'?",
                    "sentence": "ボタンが多くて (　) です。",
                    "options": ["使いにくい", "使いやすい", "使うにくい", "使ったにくい"],
                    "correct": "使いにくい",
                    "explanation": "Raíz ます (使い) + にくい = 使いにくい (difícil de usar)."
                },
                {
                    "id": "m25_ex3",
                    "question": "¿Cómo expresas 'olvidé apagar las luces'?",
                    "sentence": "部屋の電気を消す (　) を忘れました。",
                    "options": ["の", "こと", "もの", "よう"],
                    "correct": "の",
                    "explanation": "La sustantivación directa de una acción inmediata que se olvidó emplea la partícula の: 消すのを忘れました."
                },
                {
                    "id": "m25_ex4",
                    "question": "¿Qué expresión significa 'descuento' o 'rebaja' en una tienda japonesa?",
                    "sentence": "タイムセールで20％ (　) になっています。",
                    "options": ["割引", "割高", "消費", "両替"],
                    "correct": "割引",
                    "explanation": "割引 (waribiki) denota descuento de precio."
                }
            ],
            "related_topics": [
                {"step": 14, "title": "Tiendas, Grandes Almacenes y Búsqueda de Productos", "icon": "🏬", "relationship": "Precedente Comercial", "reason": "De localizar pasillos en N5 se progresa a evaluar prestaciones técnicas y negociar rebajas en N4."},
                {"step": 15, "title": "Precios, Descuentos y Caja del Combini", "icon": "💳", "relationship": "Interacción Financiera", "reason": "Conecta el pago básico con el uso estratégico de tarjetas de puntos y gestión de garantías."},
                {"step": 26, "title": "Servicios Públicos, Peluquería y Trámites", "icon": "✂️", "relationship": "Consecutivo Natural", "reason": "De adquirir productos físicos se avanza a la contratación de servicios urbanos y estéticos."}
            ],
            "sections": [
                {
                    "substep": 1,
                    "title": "Evaluación de prestaciones: 〜やすい y 〜にくい",
                    "objective": "Describir las cualidades funcionales de aparatos y herramientas evaluando su facilidad o complejidad.",
                    "grammar_points": [
                        {
                            "title": "Sufijos adjetivales de funcionalidad: Verbo [Raíz ます] + やすい / にくい",
                            "formula": "Verbo [sin ます] + やすい (fácil de hacer) / にくい (difícil de hacer)",
                            "explanation": "Transforma el verbo en un adjetivo い que describe la facilidad, ergonomía o tendencia de una acción. Funciona gramaticalmente como cualquier adjetivo い (ej. 使いやすくて, 壊れにくかった).",
                            "usage_notes": "También puede denotar susceptibilidad o predisposición: '風邪をひきやすい' (propenso a resfriarse).",
                            "examples": [
                                {"jp": "このスマートフォンは画面が大きくて見やすいです。", "kana": "このすまーとふぉんはがめんがおおきくてみやすいです。", "es": "Este smartphone tiene una pantalla grande y es fácil de ver."}
                            ]
                        }
                    ],
                    "can_dos": [
                        {"id": "Can-do 53", "task": "Comprender comparativas de productos electrónicos", "sample": "軽くて動かしやすいです。"}
                    ],
                    "vocab": [
                        {"kanji": "掃除機", "kana": "そうじき", "meaning": "aspiradora", "type": "Sustantivo"},
                        {"kanji": "軽い", "kana": "かるい", "meaning": "ligero", "type": "Adjetivo い"},
                        {"kanji": "重い", "kana": "おもい", "meaning": "pesado", "type": "Adjetivo い"},
                        {"kanji": "性能", "kana": "せいのう", "meaning": "rendimiento / prestaciones", "type": "Sustantivo"}
                    ],
                    "examples": [
                        {"jp": "この靴は滑りにくくて安全です。", "kana": "このくつはすべりにくくてあんぜんです。", "es": "Estos zapatos no resbalan con facilidad y son seguros."}
                    ]
                },
                {
                    "substep": 2,
                    "title": "Descuidos y sustantivación con 〜のを忘れました",
                    "objective": "Comunicar omisiones y olvidos cotidianos estructurando oraciones subordinadas.",
                    "grammar_points": [
                        {
                            "title": "Sustantivación de olvidos: Verbo [Forma Diccionario] + のを忘れました",
                            "formula": "Verbo [Forma Diccionario] + のを + 忘れました / 忘れていました",
                            "explanation": "Permite convertir cualquier cláusula verbal completa en el objeto directo del verbo 忘れる (olvidar).",
                            "usage_notes": "A diferencia de こと, se utiliza 'の' para acciones físicas inmediatas percibidas o realizadas por los sentidos.",
                            "examples": [
                                {"jp": "宿題を提出するのを忘れました。", "kana": "しゅくだいをつぇいていするのをわすれました。", "es": "Olvidé entregar los deberes."}
                            ]
                        }
                    ],
                    "can_dos": [
                        {"id": "Can-do 54", "task": "Preguntar si es posible un descuento en tienda", "sample": "これ、少し安くなりますか？"}
                    ],
                    "vocab": [
                        {"kanji": "忘れる", "kana": "わすれる", "meaning": "olvidar", "type": "Verbo Ichidan"},
                        {"kanji": "割引", "kana": "わりびき", "meaning": "descuento", "type": "Sustantivo"},
                        {"kanji": "動かす", "kana": "うごかす", "meaning": "mover", "type": "Verbo Godan"},
                        {"kanji": "アプリ", "kana": "あぷり", "meaning": "aplicación", "type": "Sustantivo"}
                    ],
                    "examples": [
                        {"jp": "鍵をかけるのを忘れました。", "kana": "かぎをかけるのをわすれました。", "es": "Olvidé cerrar con llave."}
                    ]
                },
                {
                    "substep": 3,
                    "title": "Ejercicios Prácticos y Evaluación",
                    "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Compras Inteligentes, Puntos y Ventajas de Consumo resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                    "is_exercise_step": True,
                    "exercises": []
                }
            ]
        },

        # M26
        {
            "step": 26,
            "title": "Servicios Públicos, Peluquería y Trámites",
            "subtitle": "資料が展示してあります。前髪を短く切ってもらえますか？ (Los documentos están expuestos. ¿Podría cortarme el flequillo más corto?)",
            "icon": "✂️",
            "level": "N4",
            "stage": "Módulo 26 · Servicios y Asistencia Urbana",
            "track": "consolidated",
            "track_label": "Módulo Consolidado",
            "sourceBooks": ["Irodori Elementary 2 (Lecciones 13 y 14, Págs. 169-196)"],
            "sourcePdf": "irodori_elementary_2.pdf",
            "detailed_guide": "Navegar con autonomía por la sociedad japonesa incluye usar bibliotecas municipales, gimnasios públicos, salones de peluquería (美容院) y servicios de paquetería (reentrega por 不在連絡票). En este módulo se profundiza en el estado intencional resultante 〜てあります (estar hecho intencionadamente por alguien) y en la solicitud educada de favores con 〜てもらえますか (¿podrías hacerme el favor de...?).",
            "objectives": [
                "Distinguir el estado intencional 〜てあります del estado intransitivo 〜ています.",
                "Solicitar modificaciones y peinados en la peluquería con 〜てもらえますか.",
                "Gestionar el reenvío de paquetes postales mediante avisos de ausencia."
            ],
            "can_dos": [
                {"id": "Can-do 56", "task": "Comprender reglamentos y normativas de gimnasios y centros cívicos", "sample": "室内用のシューズを履いてください。"},
                {"id": "Can-do 61", "task": "Leer un aviso de ausencia de correos (不在票) y tramitar la reentrega", "sample": "再配達の希望日時をウェブで指定します。"},
                {"id": "Can-do 62", "task": "Explicar el corte de pelo y detalles deseados en una peluquería japonesa", "sample": "前髪は眉毛が見えるくらいに切ってもらえますか？"}
            ],
            "grammar_focus": [
                "Estado resultante de una acción intencionada: Verbo transitivo [Forma て] + あります",
                "Petición cortés de un favor o servicio: Verbo [Forma て] + もらえますか / いただけませんか",
                "Gestión de paquetería: 不在連絡票 (aviso de ausencia), 再配達 (reentrega)"
            ],
            "included_vocab": ["展示", "利用", "規則", "不在票", "再配達", "美容院", "前髪", "短く"],
            "vocab_details": [
                {"kanji": "展示", "kana": "てんじ", "romaji": "tenji", "meaning": "exposición / muestra", "type": "Sustantivo verbal (Suru)"},
                {"kanji": "利用", "kana": "りよう", "romaji": "riyou", "meaning": "uso / utilización", "type": "Sustantivo verbal (Suru)"},
                {"kanji": "規則", "kana": "きそく", "romaji": "kisoku", "meaning": "regla / normativa", "type": "Sustantivo"},
                {"kanji": "不在票", "kana": "ふざいひょう", "romaji": "fuzaihyou", "meaning": "nota de aviso de paquete no entregado", "type": "Sustantivo"},
                {"kanji": "再配達", "kana": "さいはいたつ", "romaji": "saihaitatsu", "meaning": "reentrega de paquete", "type": "Sustantivo verbal (Suru)"},
                {"kanji": "美容院", "kana": "びよういん", "romaji": "biyouin", "meaning": "salón de belleza / peluquería", "type": "Sustantivo"}
            ],
            "examples": [
                {
                    "jp": "壁に避難経路の地図が貼ってありますので、ご確認ください。",
                    "kana": "かべにひなんけいろのちずがはってありますので、ごかくにんください。",
                    "romaji": "Kabe ni hinan keiro no chizu ga hatte arimasu node, gokakunin kudasai.",
                    "es": "En la pared está pegado el mapa de rutas de evacuación; por favor, compruébelo.",
                    "explanation": "貼る (pegar, transitivo) + てあります indica que alguien colocó el mapa expresamente con un propósito."
                },
                {
                    "jp": "後ろの髪をもう少しすいてもらえますか？",
                    "kana": "うしろのかみをもうまこしすいてもらえますか？",
                    "romaji": "Ushiro no kami o mou sukoshi suite moraemasu ka?",
                    "es": "¿Podría descargarme / vaciarme un poco más el pelo de atrás?",
                    "explanation": "Forma て + もらえますか formula una petición amable solicitando la pericia del peluquero."
                }
            ],
            "exercises": [
                {
                    "id": "m26_ex1",
                    "question": "¿Qué estructura indica que alguien abrió la ventana expresamente para ventilar y así permanece?",
                    "sentence": "部屋の窓が (　) あります。",
                    "options": ["開けて", "開いて", "閉めて", "消して"],
                    "correct": "開けて",
                    "explanation": "〜てあります requiere obligatoriamente un verbo transitivo (開ける -> 開けてあります)."
                },
                {
                    "id": "m26_ex2",
                    "question": "¿Cómo pides educadamente al estilista que te corte las puntas?",
                    "sentence": "毛先を少し (　) もらえますか？",
                    "options": ["切って", "切らないで", "切れば", "切ったら"],
                    "correct": "切って",
                    "explanation": "Forma て (切って) + もらえますか es la fórmula para solicitar un servicio."
                },
                {
                    "id": "m26_ex3",
                    "question": "¿Cómo se llama el aviso postal dejado en el buzón cuando el cartero no te encuentra?",
                    "sentence": "ポストに郵便局の (　) が入っていました。",
                    "options": ["不在票", "切符", "看板", "定期券"],
                    "correct": "不在票",
                    "explanation": "不在票 (fuzaihyou) es la notificación de intento de entrega fallido."
                },
                {
                    "id": "m26_ex4",
                    "question": "¿Cuál es la palabra que significa 'reglamento o normativa' en un edificio público?",
                    "sentence": "図書館の利用 (　) を守りましょう。",
                    "options": ["規則", "割引", "季節", "景色"],
                    "correct": "規則",
                    "explanation": "規則 (kisoku) significa reglas o reglamento."
                }
            ],
            "related_topics": [
                {"step": 9, "title": "Instrucciones de Trabajo, Peticiones y Reglas Laborales", "icon": "📋", "relationship": "Precedente Lingüístico", "reason": "De peticiones sencillas con 〜てください se pasa al estado resultante 〜てあります y solicitudes con 〜てもらえますか."},
                {"step": 25, "title": "Compras Inteligentes, Puntos y Ventajas de Consumo", "icon": "🛒", "relationship": "Continuación de Servicios", "reason": "Complementa la compra de bienes materiales con la interacción en salones de servicio y trámites urbanos."},
                {"step": 30, "title": "Vivienda, Búsqueda de Inmuebles y Resolución de Averías", "icon": "🏢", "relationship": "Evolución N3", "reason": "Prepara la interacción con administradores de fincas y servicios técnicos de mantenimiento en N3."}
            ],
            "sections": [
                {
                    "substep": 1,
                    "title": "Estado resultante intencional con 〜てあります",
                    "objective": "Describir disposiciones, preparativos y estados resultantes donde un agente humano actuó con un fin específico.",
                    "grammar_points": [
                        {
                            "title": "Estado intencional: Sustantivo が + Verbo transitivo [Forma て] + あります",
                            "formula": "Sustantivo が + Verbo transitivo [Forma て] + あります",
                            "explanation": "Señala que un objeto se encuentra en un estado determinado como resultado de una acción previa realizada intencionadamente por alguien con un objetivo claro (ej. 'la reunión ya está preparada'). El sujeto original desaparece y el objeto se marca con が.",
                            "usage_notes": "Contrasta con 〜ています, que describe un estado natural sin destacar la intención humana (ej. 窓が開いています vs 窓が開けてあります).",
                            "examples": [
                                {"jp": "カレンダーに来週の予定が書いてあります。", "kana": "かれんだーにらいしゅうのよていがかいてあります。", "es": "En el calendario están escritos los planes de la próxima semana."}
                            ]
                        }
                    ],
                    "can_dos": [
                        {"id": "Can-do 56", "task": "Comprender reglamentos de instalaciones públicas", "sample": "資料が展示してあります。"}
                    ],
                    "vocab": [
                        {"kanji": "展示", "kana": "てんじ", "meaning": "exposición", "type": "Sustantivo verbal"},
                        {"kanji": "利用", "kana": "りよう", "meaning": "uso", "type": "Sustantivo verbal"},
                        {"kanji": "規則", "kana": "きそく", "meaning": "reglas", "type": "Sustantivo"},
                        {"kanji": "案内", "kana": "あんない", "meaning": "guía", "type": "Sustantivo verbal"}
                    ],
                    "examples": [
                        {"jp": "机の上に資料が並べてあります。", "kana": "つくえのうえにしりょうがならべてあります。", "es": "Sobre la mesa están ordenados los documentos."}
                    ]
                },
                {
                    "substep": 2,
                    "title": "Peticiones en la peluquería y servicios: 〜てもらえますか",
                    "objective": "Expresar preferencias de corte de cabello y gestionar reenvíos postales.",
                    "grammar_points": [
                        {
                            "title": "Petición educada de servicio: Verbo [Forma て] + もらえますか",
                            "formula": "Verbo [Forma て] + もらえますか / (más formal: いただけませんか)",
                            "explanation": "Solicita amablemente la intervención o favor de otra persona ('¿podrías hacerme el favor de...?'). Es sumamente común al pedir ajustes en la peluquería o en mostradores de servicio.",
                            "usage_notes": "Si se desea mayor formalidad con superiores, se recurre a '〜ていただけないでしょうか'.",
                            "examples": [
                                {"jp": "荷物を今日の夕方に再配達してもらえますか？", "kana": "にもつをきょうのゆうがたにさいはいたつしてもらえますか？", "es": "¿Podría hacerme la reentrega del paquete hoy al final de la tarde?"}
                            ]
                        }
                    ],
                    "can_dos": [
                        {"id": "Can-do 62", "task": "Explicar el peinado deseado en la peluquería", "sample": "前髪を短く切ってもらえますか？"}
                    ],
                    "vocab": [
                        {"kanji": "美容院", "kana": "びよういん", "meaning": "peluquería", "type": "Sustantivo"},
                        {"kanji": "前髪", "kana": "まえがみ", "meaning": "flequillo", "type": "Sustantivo"},
                        {"kanji": "短く", "kana": "みじかく", "meaning": "de forma corta", "type": "Adverbio"},
                        {"kanji": "不在票", "kana": "ふざいひょう", "meaning": "aviso de entrega fallida", "type": "Sustantivo"}
                    ],
                    "examples": [
                        {"jp": "横の髪を少しすいてもらえますか？", "kana": "よこのかみをすこしすいてもらえますか？", "es": "¿Podría vaciarme un poco el cabello de los lados?"}
                    ]
                },
                {
                    "substep": 3,
                    "title": "Ejercicios Prácticos y Evaluación",
                    "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Servicios Públicos, Peluquería y Trámites resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                    "is_exercise_step": True,
                    "exercises": []
                }
            ]
        },

        # M27
        {
            "step": 27,
            "title": "Medio Ambiente, Prevención de Desastres y Sismos",
            "subtitle": "電気がついたままでした。地震が来ても、あわてて動かないでください。 (Las luces quedaron encendidas. Incluso si ocurre un terremoto, no se mueva con pánico.)",
            "icon": "🚨",
            "level": "N4",
            "stage": "Módulo 27 · Seguridad y Sostenibilidad",
            "track": "consolidated",
            "track_label": "Módulo Consolidado",
            "sourceBooks": ["Irodori Elementary 2 (Lecciones 15 y 16, Págs. 197-224)"],
            "sourcePdf": "irodori_elementary_2.pdf",
            "detailed_guide": "Japón es pionero mundial en gestión de residuos y cultura de protección sísmica (防災). Este módulo entrena la comprensión de alertas sismológicas inmediatas (緊急地震速報), instrucciones de simulacros de evacuación y reglas estrictas de separación de basuras (ごみの分別). Se aprende la estructura 〜たまま (dejar en el mismo estado) y las órdenes firmes de autoprotección 〜ないでください.",
            "objectives": [
                "Describir descuidos ecológicos y estados inalterados mediante Verbo [Forma た] + まま.",
                "Interpretar boletines de alerta sismológica y seguir protocolos de evacuación (避難所).",
                "Comprender y consultar las normas de reciclaje y días de recogida de residuos."
            ],
            "can_dos": [
                {"id": "Can-do 64", "task": "Comprender carteles de ahorro energético y sostenibilidad fijados en el trabajo", "sample": "使わない部屋の電気は消しましょう。"},
                {"id": "Can-do 68", "task": "Reaccionar adecuadamente ante la alerta temprana de sismos en megafonía", "sample": "緊急地震速報です。強い揺れに警戒してください。"},
                {"id": "Can-do 70", "task": "Seguir instrucciones durante un simulacro de evacuación ante terremotos", "sample": "頭を守って、あわてず机の下に入ってください。"}
            ],
            "grammar_focus": [
                "Persistencia de un estado: Verbo [Forma た] + まま ('tal cual', 'dejado encendido/abierto')",
                "Concesivo condicional: Verbo [Forma て] + も ('incluso si / aunque')",
                "Instrucciones de seguridad y protección: 慌てないでください, 避難所"
            ],
            "included_vocab": ["地震", "揺れ", "避難", "訓練", "慌てる", "ごみ", "分ける", "消す"],
            "vocab_details": [
                {"kanji": "地震", "kana": "じしん", "romaji": "jishin", "meaning": "terremoto / sismo", "type": "Sustantivo"},
                {"kanji": "揺れ", "kana": "ゆれ", "romaji": "yure", "meaning": "temblor / sacudida", "type": "Sustantivo"},
                {"kanji": "避難", "kana": "ひなん", "romaji": "hinan", "meaning": "evacuación / refugio", "type": "Sustantivo verbal (Suru)"},
                {"kanji": "訓練", "kana": "くんれん", "romaji": "kunren", "meaning": "entrenamiento / simulacro", "type": "Sustantivo verbal (Suru)"},
                {"kanji": "慌てる", "kana": "あわてる", "romaji": "awateru", "meaning": "entrar en pánico / precipitarse", "type": "Verbo Ichidan"},
                {"kanji": "分ける", "kana": "わける", "romaji": "wakeru", "meaning": "separar / clasificar", "type": "Verbo Ichidan"}
            ],
            "examples": [
                {
                    "jp": "エアコンをつけたまま外出してしまい、電気代がもったいなかったです。",
                    "kana": "えあこんをつけたままがいしゅつしてしまい、でんきだいがもったいなかったです。",
                    "romaji": "Eakon o tsuketa mama gaishutsu shite shimai, denkidai ga mottainakatta desu.",
                    "es": "Salí dejando el aire acondicionado encendido y fue un auténtico desperdicio de electricidad.",
                    "explanation": "つけた (encendido) + まま indica que el estado se mantuvo intacto mientras se realizaba otra acción."
                },
                {
                    "jp": "大きな地震が来ても、決して慌てて外に飛び出さないでください。",
                    "kana": "おおきなじしんがきても、けっしてあわててそらにとびださないでください。",
                    "romaji": "Ookina jishin ga kite mo, kesshite awatete soto ni tobidasanaide kudasai.",
                    "es": "Aunque ocurra un gran terremoto, nunca salgan corriendo hacia afuera con pánico.",
                    "explanation": "Forma ても (来ても) denota condición concesiva ('incluso si llega')."
                }
            ],
            "exercises": [
                {
                    "id": "m27_ex1",
                    "question": "¿Cómo se dice 'salí de casa dejando la ventana abierta'?",
                    "sentence": "窓を (　) まま出かけました。",
                    "options": ["開けた", "開ける", "開けて", "開かない"],
                    "correct": "開けた",
                    "explanation": "La persistencia de un estado modificado exige la forma pasada Ta: 開けたまま."
                },
                {
                    "id": "m27_ex2",
                    "question": "¿Qué significa la orden 'あわてないでください' durante un simulacro de terremoto?",
                    "sentence": "地震の時： (　) 。",
                    "options": ["No entren en pánico", "Corran hacia la calle", "Enciendan el gas", "Salten por la ventana"],
                    "correct": "No entren en pánico",
                    "explanation": "慌てる (awateru) es entrar en pánico; あわてないでください pide mantener la calma."
                },
                {
                    "id": "m27_ex3",
                    "question": "¿Cómo se llama el refugio o zona de evacuación oficial en Japón?",
                    "sentence": "災害の時は小学校が (　) になります。",
                    "options": ["避難所", "交番", "案内所", "売店"],
                    "correct": "避難所",
                    "explanation": "避難所 (hinanjo) es el albergue de evacuación asignado a cada vecindario."
                },
                {
                    "id": "m27_ex4",
                    "question": "¿Qué partícula crea el concesivo 'aunque llueva'?",
                    "sentence": "雨が (　) 、避難訓練は実施します。",
                    "options": ["降っても", "降ったら", "降ると", "降れば"],
                    "correct": "降っても",
                    "explanation": "Verbo [Forma て] + も expresa 'incluso si / aunque': 降っても."
                }
            ],
            "related_topics": [
                {"step": 6, "title": "El Hogar, Vivienda, Distribución y Electrodomésticos", "icon": "🛋️", "relationship": "Seguridad Doméstica", "reason": "De la distribución de la casa en N5 se progresa a la gestión del consumo eléctrico y prevención de riesgos."},
                {"step": 23, "title": "Eventos Comunitarios, Festivales y Condiciones", "icon": "🏮", "relationship": "Solidaridad Vecinal", "reason": "Conecta la participación ciudadana con las brigadas de prevención vecinal y simulacros."},
                {"step": 34, "title": "Prevención de Fraudes, Emergencias y Seguridad Ciudadana", "icon": "🛡️", "relationship": "Evolución N3", "reason": "Profundiza en la asistencia legal y atención de accidentes en el nivel N3."}
            ],
            "sections": [
                {
                    "substep": 1,
                    "title": "Sostenibilidad y estados persistentes con 〜たまま",
                    "objective": "Describir descuidos cotidianos y estados que permanecen sin restaurar usando 〜たまま.",
                    "grammar_points": [
                        {
                            "title": "Acción con estado residual: Verbo [Forma た] + まま",
                            "formula": "Verbo [Forma た] + まま (だ / で / にする)",
                            "explanation": "Indica que una situación originada por una acción previa se mantiene inalterada mientras transcurre el tiempo o se realiza otra actividad diferente (ej. dormir con la ropa puesta o salir con el televisor encendido).",
                            "usage_notes": "Con sustantivos se conecta con の: そのまま (tal como está), 靴のまま (con los zapatos puestos).",
                            "examples": [
                                {"jp": "水を流したまま歯を磨くのはやめましょう。", "kana": "みずをながしたままはをみがくのはやめましょう。", "es": "Dejemos de lavarnos los dientes dejando el agua corriendo."}
                            ]
                        }
                    ],
                    "can_dos": [
                        {"id": "Can-do 64", "task": "Comprender carteles de ecología y ahorro", "sample": "電気がついたままでした。"}
                    ],
                    "vocab": [
                        {"kanji": "消す", "kana": "けす", "meaning": "apagar", "type": "Verbo Godan"},
                        {"kanji": "分ける", "kana": "わける", "meaning": "separar / clasificar", "type": "Verbo Ichidan"},
                        {"kanji": "ごみ", "kana": "ごみ", "meaning": "basura", "type": "Sustantivo"},
                        {"kanji": "もったいない", "kana": "もったいない", "meaning": "desperdicio / qué lástima", "type": "Adjetivo い"}
                    ],
                    "examples": [
                        {"jp": "ドアを開けたままにしないでください。", "kana": "どあをあけたままにしないでください。", "es": "Por favor, no deje la puerta abierta."}
                    ]
                },
                {
                    "substep": 2,
                    "title": "Alertas sísmicas y protocolos de evacuación",
                    "objective": "Reconocer las órdenes de alerta temprana y evacuar con serenidad hacia zonas seguras.",
                    "grammar_points": [
                        {
                            "title": "Condicional concesivo: Verbo [Forma て] + も",
                            "formula": "Verbo [Forma て] + も / Adj-い [くても] / Sustantivo/Adj-な + でも",
                            "explanation": "Establece que incluso bajo la condición planteada, el resultado o la actitud requerida no cambia ('aunque ocurra X, hacer Y').",
                            "usage_notes": "En avisos de protección civil se reitera '揺れが収まっても' (incluso cuando cese la sacudida...).",
                            "examples": [
                                {"jp": "火災が起きても、エレベーターは絶対に使わないでください。", "kana": "かさいがおきても、えれべーたーはぜったいにつかわないでください。", "es": "Incluso si ocurre un incendio, jamás use el ascensor."}
                            ]
                        }
                    ],
                    "can_dos": [
                        {"id": "Can-do 68", "task": "Comprender avisos de alerta sismológica", "sample": "地震が来ても慌てないでください。"}
                    ],
                    "vocab": [
                        {"kanji": "地震", "kana": "じしん", "meaning": "terremoto", "type": "Sustantivo"},
                        {"kanji": "揺れ", "kana": "ゆれ", "meaning": "sacudida", "type": "Sustantivo"},
                        {"kanji": "避難", "kana": "ひなん", "meaning": "evacuación", "type": "Sustantivo verbal"},
                        {"kanji": "訓練", "kana": "くんれん", "meaning": "simulacro", "type": "Sustantivo verbal"}
                    ],
                    "examples": [
                        {"jp": "頭を保護して、揺れが収まるまで待ちましょう。", "kana": "あたまをほごして、ゆれがおさまるまでまちましょう。", "es": "Protejamos la cabeza y esperemos hasta que pase el temblor."}
                    ]
                },
                {
                    "substep": 3,
                    "title": "Ejercicios Prácticos y Evaluación",
                    "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Medio Ambiente, Prevención de Desastres y Sismos resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                    "is_exercise_step": True,
                    "exercises": []
                }
            ]
        },

        # M28
        {
            "step": 28,
            "title": "Proyección Vital, Logros y Emprendimiento",
            "subtitle": "日本語が前より話せるようになりました。将来自分の会社を作ろうと思っています。 (Ahora puedo hablar japonés mejor que antes. En el futuro pienso crear mi propia empresa.)",
            "icon": "🚀",
            "level": "N4",
            "stage": "Módulo 28 · Desarrollo Personal y Metas",
            "track": "consolidated",
            "track_label": "Módulo Consolidado",
            "sourceBooks": ["Irodori Elementary 2 (Lecciones 17 y 18, Págs. 225-256)"],
            "sourcePdf": "irodori_elementary_2.pdf",
            "detailed_guide": "Este módulo culmina el nivel N4 consolidando la habilidad de reflexionar sobre el progreso lingüístico y laboral alcanzado en Japón. Se domina el cambio gradual de facultades con 〜ようになる (llegar a ser capaz de...) y la formulación madura de proyectos a mediano y largo plazo mediante la forma volitiva unida a 思っています (Forma 意向形 + と思っている).",
            "objectives": [
                "Expresar la evolución positiva de habilidades con Verbo potencial + ようになる.",
                "Formular metas y aspiraciones profesionales con la Forma Volitiva + と思っている.",
                "Pronunciar discursos emotivos de despedida y agradecimiento en fiestas de empresa (送別会)."
            ],
            "can_dos": [
                {"id": "Can-do 73", "task": "Comentar cambios y vivencias personales transcurridas desde la llegada a Japón", "sample": "日本の生活に慣れて、日本語も話せるようになりました。"},
                {"id": "Can-do 76", "task": "Compartir sueños profesionales y aspiraciones de futuro", "sample": "将来、貿易の会社を作ろうと思っています。"},
                {"id": "Can-do 78", "task": "Pronunciar un discurso de agradecimiento en una fiesta de despedida", "sample": "皆様には本当にお世話になり、心から感謝しています。"}
            ],
            "grammar_focus": [
                "Cambio de estado o capacidad: Verbo [Forma Potencial / Diccionario] + ようになる",
                "Planes firmes y propósitos: Verbo [Forma Volitiva (意向形)] + と思っています",
                "Agradecimiento por favores recibidos: 〜ていただきました / 親切にしてもらいました"
            ],
            "included_vocab": ["将来", "会社", "夢", "職人", "苦労", "親切", "感謝", "目標"],
            "vocab_details": [
                {"kanji": "将来", "kana": "しょうらい", "romaji": "shourai", "meaning": "futuro (próximo o profesional)", "type": "Sustantivo"},
                {"kanji": "会社", "kana": "かいしゃ", "romaji": "kaisha", "meaning": "empresa / compañía", "type": "Sustantivo"},
                {"kanji": "夢", "kana": "ゆめ", "romaji": "yume", "meaning": "sueño / aspiración", "type": "Sustantivo"},
                {"kanji": "職人", "kana": "しょくにん", "romaji": "shokunin", "meaning": "artesano / maestro de oficio", "type": "Sustantivo"},
                {"kanji": "苦労", "kana": "くろう", "romaji": "kurou", "meaning": "esfuerzo / penalidades superadas", "type": "Sustantivo verbal (Suru)"},
                {"kanji": "目標", "kana": "もくひょう", "romaji": "mokuhyou", "meaning": "meta / objetivo", "type": "Sustantivo"}
            ],
            "examples": [
                {
                    "jp": "漢字を毎日練習したおかげで、新聞が読めるようになりました。",
                    "kana": "かんじをまいにちれんしゅうしたおかげで、しんぶんがよめるようになりました。",
                    "romaji": "Kanji o mainichi renshuu shita okage de, shinbun ga yomeru you ni narimashita.",
                    "es": "Gracias a haber practicado kanjis a diario, ahora he llegado a ser capaz de leer el periódico.",
                    "explanation": "Forma potencial (読める) + ようになりました describe la conquista gradual de una destreza."
                },
                {
                    "jp": "母国に戻ったら、日本語学校の先生になろうと思っています。",
                    "kana": "ぼこくにもどったら、にほんごがっこうのせんせいになろうとおもっています。",
                    "romaji": "Bokoku ni modottara, Nihongo gakkou no sensei ni narou to omotte imasu.",
                    "es": "Cuando vuelva a mi país natal, pienso convertirme en profesor de escuela de japonés.",
                    "explanation": "Forma volitiva (なろう) + と思っています expresa una determinación personal firme y meditada."
                }
            ],
            "exercises": [
                {
                    "id": "m28_ex1",
                    "question": "¿Cómo se expresa 'he llegado a ser capaz de hablar'?",
                    "sentence": "日本語が (　) ようになりました。",
                    "options": ["話せる", "話す", "話した", "話そう"],
                    "correct": "話せる",
                    "explanation": "〜ようになる se combina con el verbo potencial: 話せるようになる."
                },
                {
                    "id": "m28_ex2",
                    "question": "¿Cuál es la forma volitiva de 作る (crear/hacer) para decir 'pienso crear mi empresa'?",
                    "sentence": "将来、会社を (　) と思っています。",
                    "options": ["作ろう", "作る", "作れば", "作って"],
                    "correct": "作ろう",
                    "explanation": "Los verbos Godan cambian 'u' por 'ou': 作る -> 作ろう."
                },
                {
                    "id": "m28_ex3",
                    "question": "¿Qué palabra significa 'sueño o aspiración' de vida?",
                    "sentence": "私の (　) は寿司職人になることです。",
                    "options": ["夢", "嘘", "傷", "毒"],
                    "correct": "夢",
                    "explanation": "夢 (yume) significa sueño o aspiración."
                },
                {
                    "id": "m28_ex4",
                    "question": "¿Cómo agradeces a tus compañeros en tu despedida diciendo 'me trataron muy amablemente'?",
                    "sentence": "皆様にはとても親切に (　) ありがとうございました。",
                    "options": ["していただき", "してあげて", "してやって", "させられて"],
                    "correct": "していただき",
                    "explanation": "〜ていただく es la fórmula honorífica para reconocer un favor recibido de otros con enorme respeto."
                }
            ],
            "related_topics": [
                {"step": 19, "title": "Metas Personales, Despedidas y Expresiones de Gratitud", "icon": "🎓", "relationship": "Culminación N5", "reason": "Módulo de cierre N5 que ahora se corona con la consolidación completa de objetivos y futuro profesional N4."},
                {"step": 20, "title": "Entorno Personal, Llegada a Japón y Rasgos de Personalidad", "icon": "🧳", "relationship": "Ciclo Vital", "reason": "Cierra el arco de evolución que inició en el Módulo 20 con la llegada como foráneo recién aterrizado."},
                {"step": 37, "title": "Entorno Laboral Japonés, Deberes Profesionales y Keigo Avanzado", "icon": "💼", "relationship": "Trascendencia N3", "reason": "Enlaza la ambición de emprender con el dominio de la comunicación corporativa y keigo en N3."}
            ],
            "sections": [
                {
                    "substep": 1,
                    "title": "Desarrollo de facultades: 〜ようになる",
                    "objective": "Describir el proceso de adquisición progresiva de nuevas competencias y hábitos.",
                    "grammar_points": [
                        {
                            "title": "Evolución de destrezas: Verbo [Forma Potencial] + ようになる",
                            "formula": "Verbo [Potencial / Diccionario] + ようになる (narimashita / narimasu)",
                            "explanation": "Expresa una transición o cambio gradual desde una condición de imposibilidad previa hacia el dominio presente ('antes no podía, ahora sí').",
                            "usage_notes": "Si es una pérdida de hábito o capacidad, se formula en negativo: 〜なくなる (ej. 走れなくなった).",
                            "examples": [
                                {"jp": "一人で病院へ行けるようになりました。", "kana": "ひとりでびょういんへいけるようになりました。", "es": "Ahora ya puedo ir al hospital yo solo."}
                            ]
                        }
                    ],
                    "can_dos": [
                        {"id": "Can-do 73", "task": "Comentar la adaptación y el progreso alcanzado", "sample": "日本語が話せるようになりました。"}
                    ],
                    "vocab": [
                        {"kanji": "将来", "kana": "しょうらい", "meaning": "futuro", "type": "Sustantivo"},
                        {"kanji": "会社", "kana": "かいしゃ", "meaning": "empresa", "type": "Sustantivo"},
                        {"kanji": "目標", "kana": "もくひょう", "meaning": "meta", "type": "Sustantivo"},
                        {"kanji": "職人", "kana": "しょくにん", "meaning": "artesano", "type": "Sustantivo"}
                    ],
                    "examples": [
                        {"jp": "日本の習慣が理解できるようになりました。", "kana": "にほんのしゅうかんがりかいできるようになりました。", "es": "He llegado a ser capaz de comprender las costumbres japonesas."}
                    ]
                },
                {
                    "substep": 2,
                    "title": "Proyectos y propósitos con la Forma Volitiva + 思っています",
                    "objective": "Expresar intenciones meditadas y planes vocacionales a largo plazo.",
                    "grammar_points": [
                        {
                            "title": "Propósito deliberado: Verbo [Forma Volitiva] + と思っています",
                            "formula": "Verbo [Forma 意向形] + と思っています (tomo tte imasu)",
                            "explanation": "Expresa una determinación o plan que el hablante viene contemplando desde antes y que continúa activo en el presente.",
                            "usage_notes": "El uso de '〜と思います' denota una decisión espontánea tomada en ese preciso instante.",
                            "examples": [
                                {"jp": "将来、日本で自分のレストランを開こうと思っています。", "kana": "しょうらい、にほんでじぶんのれすとらんをひらこうとおもっています。", "es": "En el futuro pienso abrir mi propio restaurante en Japón."}
                            ]
                        }
                    ],
                    "can_dos": [
                        {"id": "Can-do 76", "task": "Compartir sueños profesionales", "sample": "会社を作ろうと思っています。"}
                    ],
                    "vocab": [
                        {"kanji": "夢", "kana": "ゆめ", "meaning": "sueño", "type": "Sustantivo"},
                        {"kanji": "苦労", "kana": "くろう", "meaning": "esfuerzo superado", "type": "Sustantivo verbal"},
                        {"kanji": "親切", "kana": "しんせつ", "meaning": "amable / bondadoso", "type": "Adjetivo な"},
                        {"kanji": "感謝", "kana": "かんしゃ", "meaning": "agradecimiento sincero", "type": "Sustantivo verbal"}
                    ],
                    "examples": [
                        {"jp": "来年、JLPTのN3を受験しようと思っています。", "kana": "らいねん、JLPTのN3をじゅけんしようとおもっています。", "es": "Pienso presentarme al examen JLPT N3 el año próximo."}
                    ]
                },
                {
                    "substep": 3,
                    "title": "Ejercicios Prácticos y Evaluación",
                    "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Proyección Vital, Logros y Emprendimiento resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                    "is_exercise_step": True,
                    "exercises": []
                }
            ]
        }
    ]

    modules.extend(modules_25_to_28)
    return modules

print("create_irodori_e2_preint_data cargado correctamente.")
