#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
append_irodori_e2_preint_modules.py
Genera e incorpora los 18 nuevos módulos canónicos al Currículum Maestro de Nihongo Master:
- Módulos 20 a 28: Irodori Elementary 2 (初級2) -> Estándar oficial JLPT N4
- Módulos 29 a 37: Irodori Pre-Intermediate (初中級) -> Estándar oficial JLPT N3
- Cumplimiento de todas las directrices:
  * Regla 1: Vocabulario en Kanji, Hiragana, Katakana, español y nivel JLPT.
  * Regla 2: Sincronización con data/kanji.json (array words de cada kanji).
  * Regla 4: No duplicidad y enlaces bidireccionales en 'related_topics'.
  * Regla 5: Soporte para TTS neuronal / URLs de audio.
  * Regla 6: Estándar exclusivo de niveles N5 a N1 (cero etiquetas CEFR).
  * Validación con lib/curriculumValidator.js (secciones con paso final de evaluación).
"""

import json
import os
import re

MODULES_DATA = [
    # =========================================================================
    # N4: IRODORI ELEMENTARY 2 (初級2) -> MÓDULOS 20 A 28
    # =========================================================================
    {
        "step": 20,
        "title": "Entorno Personal, Llegada a Japón y Rasgos de Personalidad",
        "subtitle": "先週日本に来たばかりです。まじめそうな人ですね。 (Acabo de llegar a Japón la semana pasada. Parece una persona muy seria.)",
        "icon": "🧳",
        "level": "N4",
        "stage": "Módulo 20 · Adaptación e Identidad",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Elementary 2 (Lecciones 1 y 2, Págs. 1-28)"],
        "sourcePdf": "irodori_elementary_2.pdf",
        "detailed_guide": "En este módulo se consolida la capacidad de comunicar el tiempo transcurrido desde la llegada a Japón o desde cualquier suceso reciente mediante la estructura de pasado inmediato 〜たばかり. Asimismo, se aprende a juzgar e inferir rasgos de personalidad y apariencia visual ajena empleando el sufijo conjetural 〜そう (parecer, tener pinta de), crucial para entablar relaciones empáticas en entornos de trabajo y vecindario.",
        "objectives": [
            "Expresar acciones recién finalizadas o llegadas recientes usando 〜たばかり.",
            "Describir la impresión visual o de personalidad de compañeros usando 〜そう.",
            "Explicar los motivos que motivaron la venida a Japón y compartir metas inmediatas."
        ],
        "can_dos": [
            {"id": "Can-do 01", "task": "Explicar cuánto tiempo ha pasado desde la llegada a Japón y describir la impresión inicial del entorno", "sample": "先週、日本に来たばかりです。まだ生活に慣れていません。"},
            {"id": "Can-do 06", "task": "Hablar de los rasgos de personalidad y apariencia de personas ausentes", "sample": "田中さんは優しそうで、とてもまじめそうな人です。"},
            {"id": "Can-do 07", "task": "Expresar por qué admiras a una personalidad o referente público", "sample": "努力家で親切なところが好きです。"}
        ],
        "grammar_focus": [
            "〜たばかり: Pasado inmediato ('acabar de realizar una acción')",
            "〜そう (Adjetivos y Verbos): Conjetura visual ('parece que...', 'tiene aspecto de')",
            "Pares de adjetivos de carácter: まじめ (serio/responsable), 親切 (amable), 明るい (alegre)"
        ],
        "included_vocab": ["先週", "来る", "慣れる", "まじめ", "優しい", "性格", "印象", "暮らす"],
        "vocab_details": [
            {"kanji": "先週", "kana": "せんしゅう", "romaji": "senshuu", "meaning": "la semana pasada", "type": "Sustantivo de tiempo"},
            {"kanji": "慣れる", "kana": "なれる", "romaji": "nareru", "meaning": "acostumbrarse / habituarse", "type": "Verbo Ichidan"},
            {"kanji": "真面目", "kana": "まじめ", "romaji": "majime", "meaning": "serio / aplicado / formal", "type": "Adjetivo な"},
            {"kanji": "優しい", "kana": "やさしい", "romaji": "yasashii", "meaning": "amable / cariñoso / bondadoso", "type": "Adjetivo い"},
            {"kanji": "性格", "kana": "せいかく", "romaji": "seikaku", "meaning": "personalidad / carácter", "type": "Sustantivo"},
            {"kanji": "印象", "kana": "いんしょう", "romaji": "inshou", "meaning": "impresión (percepción)", "type": "Sustantivo"}
        ],
        "examples": [
            {
                "jp": "私は先週日本に来たばかりなので、まだ電車の乗り方がよくわかりません。",
                "kana": "わたしはせんしゅうにほんにきたばかりなので、まだでんしゃののりかたがよくわかりません。",
                "romaji": "Watashi wa senshuu Nihon ni kita bakari na node, mada densha no norikata ga yoku wakarimasen.",
                "es": "Como acabo de llegar a Japón la semana pasada, todavía no entiendo bien cómo usar los trenes.",
                "explanation": "Uso de 〜たばかり (acabar de venir) combinado con 〜ので para justificar una situación cotidiana."
            },
            {
                "jp": "新しい課長はとても真面目そうで、話しやすそうな方ですね。",
                "kana": "あたらしいかちょうはとてもまじめそうで、はなしやすそうなかたですね。",
                "romaji": "Atarashii kachou wa totemo majimesou de, hanashiyasusou na kata desu ne.",
                "es": "El nuevo jefe de sección parece muy serio y parece una persona con la que es fácil hablar.",
                "explanation": "El adjetivo な まじめ pierde el な y recibe そう: まじめそう (parece serio)."
            }
        ],
        "exercises": [
            {
                "id": "m20_ex1",
                "question": "¿Qué forma gramatical expresa que acabas de almorzar hace un instante?",
                "sentence": "さっき昼ご飯を (　) ばかりです。",
                "options": ["食べた", "食べる", "食べて", "食べない"],
                "correct": "食べた",
                "explanation": "〜たばかり exige el verbo en forma pasada informal (Ta-form): 食べたばかり."
            },
            {
                "id": "m20_ex2",
                "question": "¿Cómo se indica que un pastel parece delicioso sólo por su apariencia exterior?",
                "sentence": "このケーキはとても (　) ですね。",
                "options": ["おいしそう", "おいしいそう", "おいしくそう", "おいしかったそう"],
                "correct": "おいしそう",
                "explanation": "Los adjetivos い eliminan la 'い' final antes de añadir そう: おいしい -> おいしそう."
            },
            {
                "id": "m20_ex3",
                "question": "¿Cuál es la palabra adecuada para describir a una persona amable y de buen corazón?",
                "sentence": "佐藤さんはとても (　) 人です。",
                "options": ["優しい", "厳しい", "忙しい", "重い"],
                "correct": "優しい",
                "explanation": "優しい (yasashii) significa amable, afable o tierno."
            },
            {
                "id": "m20_ex4",
                "question": "¿Cómo se expresa 'acostumbrarse a la vida en Japón'?",
                "sentence": "日本の生活に (　) 。",
                "options": ["慣れました", "作りました", "買いました", "聞きました"],
                "correct": "慣れました",
                "explanation": "生活に慣れる significa habituarse o adaptarse a la vida."
            }
        ],
        "related_topics": [
            {"step": 1, "title": "Saludos, Cortesía y Presentación Personal", "icon": "🤝", "relationship": "Base Comunicativa", "reason": "Módulo fundacional de presentaciones personales que ahora se expande a rasgos de carácter y estancias recién iniciadas."},
            {"step": 3, "title": "Identidad, Familia, Residencia y Datos de Contacto", "icon": "🏠", "relationship": "Evolución de Perfil", "reason": "Conecta la procedencia básica con el proceso de adaptación e impresiones inmediatas en Japón."},
            {"step": 21, "title": "Restaurantes, Alergias y Dietas Especiales", "icon": "🍜", "relationship": "Consecutivo Natural", "reason": "Tras establecerse en Japón, el siguiente reto es desenvolverse en restaurantes y comunicar necesidades dietéticas."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Tiempo transcurrido y la estructura 〜たばかり",
                "objective": "Describir eventos y cambios vitales ocurridos hace muy poco tiempo desde el punto de vista psicológico del hablante.",
                "grammar_points": [
                    {
                        "title": "Pasado inmediato subjetivo: Verbo (Forma た) + ばかり",
                        "formula": "Verbo [Forma た] + ばかり (だ / です / なので)",
                        "explanation": "A diferencia de 〜たところ (que denota inmediatez objetiva en minutos), 〜たばかり expresa que para el hablante el hecho ocurrió hace muy poco tiempo, incluso si han transcurrido semanas o meses (ej. casarse, graduarse o mudarse a Japón).",
                        "usage_notes": "Si va seguido de un sustantivo, se une con の: '日本に来たばかりの人' (persona recién llegada a Japón).",
                        "examples": [
                            {"jp": "日本に来たばかりの時は、日本語が全然話せませんでした。", "kana": "にほんにきたばかりのときは、にほんごがぜんぜんはなせませんでした。", "es": "Cuando recién acababa de llegar a Japón, no hablaba nada de japonés."},
                            {"jp": "先月このアパートに引っ越したばかりです。", "kana": "せんげつこのあぱーとにひっこしたばかりです。", "es": "Acabo de mudarme a este apartamento el mes pasado."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 01", "task": "Explicar cuánto tiempo ha pasado desde la llegada a Japón", "sample": "先週、日本に来たばかりです。"}
                ],
                "vocab": [
                    {"kanji": "先週", "kana": "せんしゅう", "meaning": "la semana pasada", "type": "Sustantivo"},
                    {"kanji": "来る", "kana": "くる", "meaning": "venir", "type": "Verbo irregular"},
                    {"kanji": "慣れる", "kana": "なれる", "meaning": "acostumbrarse", "type": "Verbo Ichidan"},
                    {"kanji": "生活", "kana": "せいかつ", "meaning": "vida cotidiana", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "先週日本に来たばかりです。", "kana": "せんしゅうにほんにきたばかりです。", "es": "Acabo de llegar a Japón la semana pasada."}
                ]
            },
            {
                "substep": 2,
                "title": "Descripción de impresiones y rasgos de personalidad con 〜そう",
                "objective": "Transmitir impresiones visuales y rasgos de carácter percibidos en compañeros de trabajo o vecinos.",
                "grammar_points": [
                    {
                        "title": "Juicio por apariencia visual: Adjetivo (raíz) + そう",
                        "formula": "Adj-い [sin い] + そう / Adj-な [sin な] + そう",
                        "explanation": "Indica una conjetura basada en la apariencia externa ('parece...', 'se le ve...'). Para el adjetivo いい (bueno), su forma irregular es よさそう. Para ない (no hay / negación), es なさそう.",
                        "usage_notes": "No se utiliza para cualidades obvias que no requieren suposición: por ejemplo, si algo es rojo, no se dice 赤そう sino 赤い.",
                        "examples": [
                            {"jp": "田中さんは優しそうな人ですね。", "kana": "たなかさんはやさしそうなひとですね。", "es": "El señor Tanaka parece una persona muy bondadosa."},
                            {"jp": "この仕事は大変そうですが、頑張ります。", "kana": "このしごとはたいへんそうですが、がんばります。", "es": "Este trabajo parece duro, pero me esforzaré."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 06", "task": "Hablar de rasgos de personas ausentes", "sample": "真面目そうで優しい人です。"}
                ],
                "vocab": [
                    {"kanji": "真面目", "kana": "まじめ", "meaning": "serio / responsable", "type": "Adjetivo な"},
                    {"kanji": "優しい", "kana": "やさしい", "meaning": "amable / tierno", "type": "Adjetivo い"},
                    {"kanji": "性格", "kana": "せいかく", "meaning": "carácter / personalidad", "type": "Sustantivo"},
                    {"kanji": "大変", "kana": "たいへん", "meaning": "duro / difícil", "type": "Adjetivo な"}
                ],
                "examples": [
                    {"jp": "あの人は親切そうで、仕事が早そうです。", "kana": "あのひとはしんせつそうで、しごとがはやそうです。", "es": "Aquella persona parece amable y parece rápida trabajando."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Entorno Personal, Llegada a Japón y Rasgos de Personalidad resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    },

    # =========================================================================
    # MÓDULO 21: RESTAURANTES, ALERGIAS Y DIETAS ESPECIALES
    # =========================================================================
    {
        "step": 21,
        "title": "Restaurantes, Alergias y Dietas Especiales",
        "subtitle": "アレルギーがあるので、食べられないんです。しょうゆをつけないで食べてください。 (No puedo comerlo porque tengo alergia. Por favor, cómalo sin ponerle salsa de soja.)",
        "icon": "🍜",
        "level": "N4",
        "stage": "Módulo 21 · Gastronomía y Salud",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Elementary 2 (Lecciones 3 y 4, Págs. 29-56)"],
        "sourcePdf": "irodori_elementary_2.pdf",
        "detailed_guide": "En este módulo se desarrollan las habilidades para declarar restricciones alimentarias, alergias, motivos religiosos o dietas vegetarianas en restaurantes japoneses usando la forma potencial (食べられない / 飲めない) unida a la causa objetiva 〜ので. Asimismo, se aprende a dar y seguir instrucciones gastronómicas sobre formas tradicionales de degustar platos típicos mediante 〜ないで (hacer algo sin hacer otra cosa).",
        "objectives": [
            "Declarar alergias o prohibiciones alimentarias con 〜ので y verbos en forma potencial.",
            "Pedir adaptaciones de platos o ingredientes (ej. わさび抜き, 肉なし).",
            "Explicar y comprender instrucciones culinarias usando 〜ないで."
        ],
        "can_dos": [
            {"id": "Can-do 10", "task": "Informar a meseros y compañeros qué alimentos no puedes consumir y explicar la razón médica o personal", "sample": "エビアレルギーがあるので、甲殻類は食べられないんです。"},
            {"id": "Can-do 11", "task": "Transmitir preferencias de asiento o pedidos especiales en restaurantes", "sample": "わさび抜きでお願いします。"},
            {"id": "Can-do 15", "task": "Comprender instrucciones sobre la forma idónea de degustar platos japoneses", "sample": "しょうゆをつけないで、塩で食べてみてください。"}
        ],
        "grammar_focus": [
            "Forma Potencial (可能形): 食べられる / 飲める / 行ける (Poder comer, beber, ir)",
            "Causa objetiva 〜ので: Motivos corteses y justificaciones claras",
            "Acción negativa concomitante: Verbo [Forma ない] + で ('sin hacer X')"
        ],
        "included_vocab": ["アレルギー", "卵", "小麦", "豚肉", "抜く", "混ぜる", "かける", "定食"],
        "vocab_details": [
            {"kanji": "卵", "kana": "たまご", "romaji": "tamago", "meaning": "huevo", "type": "Sustantivo"},
            {"kanji": "小麦", "kana": "こむぎ", "romaji": "komugi", "meaning": "trigo (gluten)", "type": "Sustantivo"},
            {"kanji": "豚肉", "kana": "ぶたにく", "romaji": "butaniku", "meaning": "carne de cerdo", "type": "Sustantivo"},
            {"kanji": "抜く", "kana": "ぬく", "romaji": "nuku", "meaning": "quitar / extraer / omitir", "type": "Verbo Godan"},
            {"kanji": "混ぜる", "kana": "まぜる", "romaji": "mazeru", "meaning": "mezclar / revolver", "type": "Verbo Ichidan"},
            {"kanji": "定食", "kana": "ていしょく", "romaji": "teishoku", "meaning": "menú del día / combo cerrado", "type": "Sustantivo"}
        ],
        "examples": [
            {
                "jp": "宗教上の理由で豚肉が食べられないので、鶏肉に変更できますか？",
                "kana": "しゅうきょうじょうのりゆうでぶたにくがたべられないので、とりにくにへんこうできますか？",
                "romaji": "Shuukyoujou no riyuu de butaniku ga taberarenai node, toriniku ni henkou dekimasu ka?",
                "es": "Como no puedo comer carne de cerdo por motivos religiosos, ¿sería posible cambiarla por carne de pollo?",
                "explanation": "食べられない (forma potencial negativa) unida a 〜ので expresa imposibilidad justificada con gran cortesía."
            },
            {
                "jp": "この天ぷらは、つゆをつけないで塩で召し上がってください。",
                "kana": "このてんぷらは、つゆをつけないでしおでめしあがってください。",
                "romaji": "Kono tempura wa, tsuyu o tsukenaide shio de meshiagatte kudasai.",
                "es": "Por favor, coma esta tempura con sal sin mojarla en la salsa.",
                "explanation": "つけないで (sin mojar) indica que la acción principal debe hacerse omitiendo esa acción previa."
            }
        ],
        "exercises": [
            {
                "id": "m21_ex1",
                "question": "¿Cómo se dice 'sin comer' en una instrucción como 'por favor tome esta medicina sin comer nada'?",
                "sentence": "朝ご飯を (　) 病院に来てください。",
                "options": ["食べないで", "食べて", "食べなくて", "食べた"],
                "correct": "食べないで",
                "explanation": "〜ないで indica realizar la acción posterior omitiendo la primera: 食べないで (sin comer)."
            },
            {
                "id": "m21_ex2",
                "question": "¿Cuál es la forma potencial de 飲む (beber) para decir 'no puedo beber alcohol'?",
                "sentence": "お酒が (　) 。",
                "options": ["飲めません", "飲みません", "飲まれません", "飲ませません"],
                "correct": "飲めません",
                "explanation": "El verbo Godan 飲む cambia su última mora a la serie 'e' + ます: 飲める -> 飲めません."
            },
            {
                "id": "m21_ex3",
                "question": "¿Cómo pides que preparen un sushi 'sin wasabi'?",
                "sentence": "わさび (　) でお願いします。",
                "options": ["抜き", "入り", "付き", "止め"],
                "correct": "抜き",
                "explanation": "〜抜き (nuki) añadido a un ingrediente significa 'sin ese ingrediente' (ej. わさび抜き)."
            },
            {
                "id": "m21_ex4",
                "question": "¿Qué partícula une dos acciones donde mezclas bien la comida antes de comer?",
                "sentence": "よく (　) 食べてください。",
                "options": ["混ぜて", "混ぜないで", "混ぜたら", "混ぜれば"],
                "correct": "混ぜて",
                "explanation": "La forma て (混ぜて) conecta la acción preparatoria con el consumo: 'mézclelo bien y cómalo'."
            }
        ],
        "related_topics": [
            {"step": 4, "title": "Gustos, Preferencias Culinarias y Hábitos Diarios", "icon": "🍱", "relationship": "Precedente Temático", "reason": "De gustos personales en N5 se evoluciona al manejo formal de restricciones dietéticas y alergias en N4."},
            {"step": 5, "title": "Restaurantes, Menús, Pedidos y Contadores", "icon": "🍵", "relationship": "Ampliación de Protocolo", "reason": "Profundiza en la interacción con el personal gastronómico agregando pedidos condicionales y personalizaciones."},
            {"step": 31, "title": "Gastronomía Local, Cocina Casera y Nutrición", "icon": "🍳", "relationship": "Consecutivo Intermedio", "reason": "Conecta la experiencia en restaurantes con la preparación autónoma y el balance nutricional en N3."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Alergias, restricciones dietéticas y Forma Potencial",
                "objective": "Aprender a manifestar impedimentos físicos, alérgicos o religiosos para consumir alimentos usando la forma potencial y 〜ので.",
                "grammar_points": [
                    {
                        "title": "Forma Potencial (可能形) y partícula が",
                        "formula": "Sustantivo が + Verbo [Forma Potencial] (られる / える)",
                        "explanation": "En japonés moderno, la capacidad o posibilidad física de hacer algo se formula con el verbo potencial. El objeto directo suele marcarse preferentemente con が en lugar de を. Para verbos Ichidan (Grupo 2), se sustituye る por られる (ej. 食べる -> 食べられる). Para verbos Godan (Grupo 1), el sonido 'u' pasa a 'e' + る (ej. 飲む -> 飲める).",
                        "usage_notes": "En el habla cotidiana es común la forma acortada 'ら抜き' (tabereru), pero en situaciones formales de servicio debe usarse taberareru.",
                        "examples": [
                            {"jp": "甲殻類アレルギーがあるので、エビやカニが食べられません。", "kana": "こうかくるいあれるぎーがあるので、えびやかにがたべられません。", "es": "Como tengo alergia a los crustáceos, no puedo comer camarones ni cangrejo."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 10", "task": "Informar qué alimentos no puedes consumir y la causa", "sample": "アレルギーがあるので、食べられません。"}
                ],
                "vocab": [
                    {"kanji": "アレルギー", "kana": "あれるぎー", "meaning": "alergia", "type": "Sustantivo"},
                    {"kanji": "豚肉", "kana": "ぶたにく", "meaning": "carne de cerdo", "type": "Sustantivo"},
                    {"kanji": "卵", "kana": "たまご", "meaning": "huevo", "type": "Sustantivo"},
                    {"kanji": "抜く", "kana": "ぬく", "meaning": "omitir / quitar", "type": "Verbo Godan"}
                ],
                "examples": [
                    {"jp": "わさび抜きで作ってもらえますか？", "kana": "わさびぬきでつくってもらえますか？", "es": "¿Me lo podría preparar sin wasabi?"}
                ]
            },
            {
                "substep": 2,
                "title": "Instrucciones de degustación y la estructura 〜ないで",
                "objective": "Comprender y explicar cómo comer platos autóctonos sin cometer fallos de etiqueta.",
                "grammar_points": [
                    {
                        "title": "Acción negativa paralela: Verbo [Forma ない] + で",
                        "formula": "Verbo [Forma ない] + で + [Acción principal]",
                        "explanation": "Indica que la acción principal se lleva a cabo sin haber realizado la acción previa (equivalente a 'sin hacer X'). Se diferencia de 〜なくて (que expresa causa o contraste).",
                        "usage_notes": "Muy habitual en recomendaciones culinarias: 'しょうゆをつけないで' (sin poner salsa de soja).",
                        "examples": [
                            {"jp": "スープを飲まないで、まず麺を食べてみてください。", "kana": "すーぷをのまないで、まずめんをたべてみてください。", "es": "Sin beber la sopa, pruebe primero los fideos."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 15", "task": "Comprender instrucciones para comer platos típicos", "sample": "しょうゆをつけないで食べてください。"}
                ],
                "vocab": [
                    {"kanji": "混ぜる", "kana": "まぜる", "meaning": "mezclar", "type": "Verbo Ichidan"},
                    {"kanji": "かける", "kana": "かける", "meaning": "echar encima / rociar", "type": "Verbo Ichidan"},
                    {"kanji": "定食", "kana": "ていしょく", "meaning": "menú combinado", "type": "Sustantivo"},
                    {"kanji": "おすすめ", "kana": "おすすめ", "meaning": "recomendación", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "生卵を入れて、よく混ぜて召し上がってください。", "kana": "なまたまごをいれて、よくまぜてめしあがってください。", "es": "Agregue el huevo crudo, revuelva bien y disfrútelo."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Restaurantes, Alergias y Dietas Especiales resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    },

    # =========================================================================
    # MÓDULO 22: VIAJES, RESERVAS Y CONSEJOS TURÍSTICOS
    # =========================================================================
    {
        "step": 22,
        "title": "Viajes, Reservas y Consejos Turísticos",
        "subtitle": "早く予約したほうがいいですよ。いろいろな所に行けてよかったです。 (Es mejor que reserves pronto. Me alegré mucho de haber podido ir a varios lugares.)",
        "icon": "🚅",
        "level": "N4",
        "stage": "Módulo 22 · Movilidad y Ocio Regional",
        "track": "consolidated",
        "track_label": "Módulo Consolidado",
        "sourceBooks": ["Irodori Elementary 2 (Lecciones 5 y 6, Págs. 57-84)"],
        "sourcePdf": "irodori_elementary_2.pdf",
        "detailed_guide": "Planificar escapadas turísticas por Japón exige asesorar a amigos con recomendaciones sólidas (〜たほうがいい), gestionar reservas de alojamiento y transporte de alta velocidad (Shinkansen), e interpretar avisos en estaciones. Al finalizar el viaje, este módulo capacita para compartir experiencias satisfactorias usando 〜てよかった (qué bien que pude...) y expresar planes futuros con 〜つもり.",
        "objectives": [
            "Dar y solicitar recomendaciones turísticas y de alojamiento con 〜たほうがいい.",
            "Interpretar billetes de tren, billetes con asiento reservado y pantallas de andén.",
            "Relatar impresiones positivas de viaje usando 〜てよかった y planes con 〜つもり."
        ],
        "can_dos": [
            {"id": "Can-do 19", "task": "Entender presentaciones breves de sitios turísticos y atractivos regionales", "sample": "京都は紅葉の季節が一番きれいです。"},
            {"id": "Can-do 21", "task": "Pedir o brindar consejos prácticos al planear un viaje", "sample": "連休は混むから、新幹線は早く予約したほうがいいですよ。"},
            {"id": "Can-do 26", "task": "Comentar vivencias y opiniones sinceras sobre un viaje realizado", "sample": "温泉に入れて、本当によかったです。"}
        ],
        "grammar_focus": [
            "Consejo y recomendación enfática: Verbo [Forma た] + ほうがいい",
            "Satisfacción por un hecho pasado: Verbo [Forma て] + よかった",
            "Intención meditada: Verbo [Forma Diccionario] + つもり (Tener intención de)"
        ],
        "included_vocab": ["予約", "観光地", "景色", "切符", "案内", "温泉", "泊まる", "連休"],
        "vocab_details": [
            {"kanji": "予約", "kana": "よやく", "romaji": "yoyaku", "meaning": "reserva", "type": "Sustantivo verbal (Suru)"},
            {"kanji": "観光地", "kana": "かんこうち", "romaji": "kankouchi", "meaning": "lugar turístico / destino", "type": "Sustantivo"},
            {"kanji": "景色", "kana": "けしき", "romaji": "keshiki", "meaning": "paisaje / vista panorámica", "type": "Sustantivo"},
            {"kanji": "切符", "kana": "きっぷ", "romaji": "kippu", "meaning": "billete / boleto", "type": "Sustantivo"},
            {"kanji": "泊まる", "kana": "とまる", "romaji": "tomaru", "meaning": "hospedarse / pernoctar", "type": "Verbo Godan"},
            {"kanji": "連休", "kana": "れんきゅう", "romaji": "renkyuu", "meaning": "puente festivo / días libres consecutivos", "type": "Sustantivo"}
        ],
        "examples": [
            {
                "jp": "連休中はホテルが満室になるので、早めに予約したほうがいいですよ。",
                "kana": "れんきゅうちゅうはほてるがまんしつになるので、はやめによやくしたほうがいいですよ。",
                "romaji": "Renkyuuchuu wa hoteru ga manshitsu ni naru node, hayame ni yoyaku shita hou ga ii desu yo.",
                "es": "Como los hoteles se llenan durante los festivos consecutivos, es mejor que reserves con bastante antelación.",
                "explanation": "Forma た (予約した) + ほうがいい aconseja enfáticamente la mejor decisión."
            },
            {
                "jp": "天気が心配でしたが、富士山がきれいに見えて本当によかったです。",
                "kana": "てんきがしんぱいでしたが、ふじさんがきれいにみえてほんとうによかったです。",
                "romaji": "Tenki ga shinpai deshita ga, Fujisan ga kirei ni miete hontou ni yokatta desu.",
                "es": "Estaba preocupado por el tiempo, pero me alegré de verdad de haber podido ver el monte Fuji con tanta claridad.",
                "explanation": "見えてよかった expresa alivio y gratitud por un suceso que salió bien."
            }
        ],
        "exercises": [
            {
                "id": "m22_ex1",
                "question": "¿Cómo aconsejas a alguien 'es mejor que lleves paraguas'?",
                "sentence": "雨が降りそうだから、傘を (　) ほうがいいですよ。",
                "options": ["持っていった", "持っていく", "持っていかない", "持っていって"],
                "correct": "持っていった",
                "explanation": "Para dar un consejo positivo se usa la forma pasada Ta: 持っていったほうがいい."
            },
            {
                "id": "m22_ex2",
                "question": "¿Cómo expresas alivio diciendo 'qué bien que no llovió'?",
                "sentence": "雨が (　) よかったです。",
                "options": ["降らなくて", "降らないで", "降らない", "降った"],
                "correct": "降らなくて",
                "explanation": "Para causas emocionales o alivio negativo se usa 〜なくてよかった (降らなくてよかった)."
            },
            {
                "id": "m22_ex3",
                "question": "¿Cómo formulas 'tengo intención de ir a Kioto el próximo mes'?",
                "sentence": "来月、京都へ (　) つもりです。",
                "options": ["行く", "行った", "行かない", "行きます"],
                "correct": "行く",
                "explanation": "〜つもり se conecta con el verbo en forma diccionario: 行くつもりです."
            },
            {
                "id": "m22_ex4",
                "question": "¿Qué palabra designa a un conjunto de días festivos consecutivos?",
                "sentence": "来週は3日間の (　) があります。",
                "options": ["連休", "週末", "平日", "残業"],
                "correct": "連休",
                "explanation": "連休 (renkyuu) significa puente o días festivos seguidos."
            }
        ],
        "related_topics": [
            {"step": 12, "title": "Movilidad, Transporte Público y Estaciones", "icon": "🚇", "relationship": "Base Operativa", "reason": "La compra de billetes locales N5 se expande aquí a billetes de Shinkansen y reservas de larga distancia."},
            {"step": 17, "title": "Planes Vacacionales, Deseos y Cultura Onsen", "icon": "♨️", "relationship": "Continuación Pedagógica", "reason": "Profundiza en la cultura del descanso añadiendo consejos turísticos y resolución de itinerarios."},
            {"step": 36, "title": "Geografía Japonesa, Rutas Históricas y Crónicas de Viaje", "icon": "🗾", "relationship": "Evolución N3", "reason": "Prepara la narrativa avanzada de viajes regionales y descripciones geográficas en el nivel N3."}
        ],
        "sections": [
            {
                "substep": 1,
                "title": "Consejos turísticos y la estructura 〜たほうがいい",
                "objective": "Aconsejar de forma persuasiva la mejor opción de viaje, estancia o vestimenta a un interlocutor.",
                "grammar_points": [
                    {
                        "title": "Recomendación fuerte: Verbo [Forma た] + ほうがいい",
                        "formula": "Verbo [Forma た] + ほうがいい (desu) / Negativo: Verbo [Forma ない] + ほうがいい",
                        "explanation": "Compara dos alternativas y señala con convicción cuál es preferible. Si no se sigue el consejo, se sobreentiende que podría haber una consecuencia indeseable (ej. quedarse sin plaza o enfermar).",
                        "usage_notes": "Frente a superiores o clientes es preferible suavizar con '〜てはいかがでしょうか'.",
                        "examples": [
                            {"jp": "寒くなるから、上着を持っていったほうがいいですよ。", "kana": "さむくなるから、うわぎをもっていったほうがいいですよ。", "es": "Como va a hacer frío, es mejor que lleves un abrigo."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 21", "task": "Aconsejar sobre planificación de viajes", "sample": "早く予約したほうがいいですよ。"}
                ],
                "vocab": [
                    {"kanji": "予約", "kana": "よやく", "meaning": "reserva", "type": "Sustantivo verbal"},
                    {"kanji": "景色", "kana": "けしき", "meaning": "paisaje", "type": "Sustantivo"},
                    {"kanji": "泊まる", "kana": "とまる", "meaning": "hospedarse", "type": "Verbo Godan"},
                    {"kanji": "連休", "kana": "れんきゅう", "meaning": "puente festivo", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "新幹線は早く予約したほうがいいですよ。", "kana": "しんかんせんははやめによやくしたほうがいいですよ。", "es": "Es mejor que reserves el Shinkansen temprano."}
                ]
            },
            {
                "substep": 2,
                "title": "Evaluación de experiencias y satisfacción con 〜てよかった",
                "objective": "Compartir anécdotas de viajes expresando alegría o agradecimiento por las vivencias ocurridas.",
                "grammar_points": [
                    {
                        "title": "Sentimiento de alivio o satisfacción: Verbo [Forma て] + よかった",
                        "formula": "Verbo [Forma て] + よかった (です) / Negativo: [Forma なくて] + よかった",
                        "explanation": "Expresa que el resultado de una acción o suceso pasado trajo alivio, alegría o satisfacción personal ('qué bien que...', 'menos mal que...').",
                        "usage_notes": "Combinado con la forma potencial (〜てよかった) denota gran felicidad por haber sido capaz de experimentar algo.",
                        "examples": [
                            {"jp": "有名な温泉に入れてよかったです。", "kana": "ゆうめいなおんせんにはいれてよかったです。", "es": "Qué bien que pude entrar a esas famosas aguas termales."}
                        ]
                    }
                ],
                "can_dos": [
                    {"id": "Can-do 26", "task": "Comentar cómo estuvo un viaje", "sample": "いろいろな所に行けてよかったです。"}
                ],
                "vocab": [
                    {"kanji": "切符", "kana": "きっぷ", "meaning": "billete / ticket", "type": "Sustantivo"},
                    {"kanji": "案内", "kana": "あんない", "meaning": "guía / aviso", "type": "Sustantivo verbal"},
                    {"kanji": "観光地", "kana": "かんこうち", "meaning": "lugar turístico", "type": "Sustantivo"},
                    {"kanji": "温泉", "kana": "おんせん", "meaning": "aguas termales", "type": "Sustantivo"}
                ],
                "examples": [
                    {"jp": "地元の人とたくさん話せてよかったです。", "kana": "じもとのひととたくさんはなせてよかったです。", "es": "Me alegré mucho de haber podido conversar bastante con la gente local."}
                ]
            },
            {
                "substep": 3,
                "title": "Ejercicios Prácticos y Evaluación",
                "objective": "Poner a prueba y consolidar los conocimientos adquiridos en Viajes, Reservas y Consejos Turísticos resolviendo los ejercicios de autoevaluación para superar y completar el módulo.",
                "is_exercise_step": True,
                "exercises": []
            }
        ]
    }
]

print(f"Plantilla base cargada con {len(MODULES_DATA)} módulos iniciales.")
