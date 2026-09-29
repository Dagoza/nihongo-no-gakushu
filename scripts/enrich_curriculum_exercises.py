import json

with open("data/curriculum.json", "r", encoding="utf-8") as f:
    modules = json.load(f)

new_exercises = {
    2: [
        {
            "id": "m2_ex2",
            "question": "¿Cómo indicas que puedes hablar inglés usando la forma de capacidad?",
            "sentence": "私は英語が [___]。",
            "options": ["できます", "言います", "行きます", "飲みます"],
            "correct": "できます",
            "explanation": "できます (dekimasu) significa 'poder / ser capaz de', y se acompaña de la partícula が: 英語ができます."
        },
        {
            "id": "m2_ex3",
            "question": "¿Cómo preguntas '¿Cómo se dice esto en japonés?'?",
            "sentence": "これは日本語で何と [___] か？",
            "options": ["言います", "聞きます", "書きます", "読みます"],
            "correct": "言います",
            "explanation": "何と言いますか (nan to iimasu ka) es la fórmula fija canónica para preguntar cómo se pronuncia o dice algo."
        }
    ],
    3: [
        {
            "id": "m3_ex1",
            "question": "¿Cómo dices que tu familia está compuesta por 4 personas?",
            "sentence": "私の家族は [___] です。",
            "options": ["4人", "4つ", "4枚", "4本"],
            "correct": "4人",
            "explanation": "Para contar personas se utiliza el contador 人 (にん / 4人は「よにん」)."
        },
        {
            "id": "m3_ex2",
            "question": "¿Cómo indicas tu edad diciendo 'Tengo 22 años'?",
            "sentence": "私は東京に住んでいます。[___] です。",
            "options": ["22歳", "22個", "22時", "22日"],
            "correct": "22歳",
            "explanation": "Para la edad se utiliza el contador 歳 / 才 (さい): 22歳 (にじゅうにさい)."
        }
    ],
    5: [
        {
            "id": "m5_ex1",
            "question": "¿Cómo solicitas tu comida para llevar en un local de comida rápida?",
            "sentence": "持ち帰りで [___]。",
            "options": ["お願いします", "いりません", "結構です", "ありました"],
            "correct": "お願いします",
            "explanation": "持ち帰りでお願いします (mochikaeri de onegai shimasu) significa 'Para llevar, por favor'."
        },
        {
            "id": "m5_ex2",
            "question": "¿Cómo pides dos unidades de bebida usando el contador general japonés?",
            "sentence": "ウーロン茶を [___] ください。",
            "options": ["2つ", "2人", "2本", "2枚"],
            "correct": "2つ",
            "explanation": "2つ (ふたつ) es el contador nativo para dos cosas genéricas en hostelería."
        }
    ],
    6: [
        {
            "id": "m6_ex1",
            "question": "¿Cómo indicas la existencia de habitaciones en un plano de vivienda?",
            "sentence": "1階に部屋が4つ [___]。",
            "options": ["あります", "います", "します", "おきます"],
            "correct": "あります",
            "explanation": "Para objetos o estancias inanimadas se usa el verbo de existencia あります."
        },
        {
            "id": "m6_ex2",
            "question": "¿Cómo preguntas si el apartamento cuenta con electrodomésticos clave?",
            "sentence": "エアコンや洗濯機は [___] か？",
            "options": ["あります", "います", "使います", "買います"],
            "correct": "あります",
            "explanation": "ありますか pregunta por la existencia o disponibilidad de electrodomésticos en el piso."
        },
        {
            "id": "m6_ex3",
            "question": "¿Cómo indicas que resides solo en un apartamento?",
            "sentence": "アパートで [___] をしています。",
            "options": ["一人暮らし", "会社員", "留学生", "買い物"],
            "correct": "一人暮らし",
            "explanation": "一人暮らし (ひとりづらし / hitorigurashi) significa vivir solo/a de forma independiente."
        }
    ],
    9: [
        {
            "id": "m9_ex1",
            "question": "¿Cómo das una instrucción de trabajo para fotocopiar 5 hojas de un documento?",
            "sentence": "この書類を5枚 [___] ください。",
            "options": ["コピーして", "見て", "書いて", "捨てて"],
            "correct": "コピーして",
            "explanation": "Forma て + ください para peticiones laborales: コピーしてください (por favor fotocopie)."
        },
        {
            "id": "m9_ex2",
            "question": "¿Cómo confirmas la cantidad de copias encargadas por tu compañero?",
            "sentence": "はい、[___] ですね。わかりました。",
            "options": ["30枚", "30本", "30個", "30人"],
            "correct": "30枚",
            "explanation": "Para objetos planos y delgados como folios o impresiones se usa el contador 枚 (まい)."
        },
        {
            "id": "m9_ex3",
            "question": "¿Cómo se formula la prohibición cortés de no fumar en un área de trabajo?",
            "sentence": "ここでタバコを [___] でください。",
            "options": ["吸わない", "吸って", "吸います", "吸おう"],
            "correct": "吸わない",
            "explanation": "Petición negativa: Verbo en forma ない + でください (吸わないでください)."
        }
    ],
    10: [
        {
            "id": "m10_ex1",
            "question": "¿Cómo explicas tu afición diciendo 'Mi hobby es escuchar música'?",
            "sentence": "趣味は音楽を [___] ことです。",
            "options": ["聴く", "聴いて", "聴きます", "聴いた"],
            "correct": "聴く",
            "explanation": "Nominalización con こと: Verbo en forma diccionario + ことです (聴くことです)."
        },
        {
            "id": "m10_ex2",
            "question": "¿Cómo listas actividades variadas de ocio de fin de semana con la estructura 〜たり〜たり?",
            "sentence": "休みの日は家で映画を [___] します。",
            "options": ["見たり", "見て", "見る", "見ます"],
            "correct": "見たり",
            "explanation": "Forma 〜たり 〜たり します para enumerar acciones representativas no exhaustivas de ocio."
        }
    ],
    11: [
        {
            "id": "m11_ex1",
            "question": "¿Cómo se llama el folleto promocional de un festival de verano?",
            "sentence": "駅で夏祭りの [___] をもらいました。",
            "options": ["チラシ", "切符", "定期券", "看板"],
            "correct": "チラシ",
            "explanation": "チラシ (chirashi) es el término común para volante o folleto informativo de eventos."
        },
        {
            "id": "m11_ex2",
            "question": "¿Cómo aceptas con entusiasmo una invitación diciendo '¡Sí, vayamos sin falta!'?",
            "sentence": "いっしょに行きませんか？ — ええ、ぜひ [___]！",
            "options": ["行きましょう", "行きます", "行きません", "行きたい"],
            "correct": "行きましょう",
            "explanation": "ぜひ行きましょう (zehi ikimashou) expresa aceptación cordial y entusiasmada a una propuesta."
        },
        {
            "id": "m11_ex3",
            "question": "¿Cómo declinas amablemente una invitación explicando que tienes un compromiso?",
            "sentence": "すみません、その日はちょっと [___] があって…",
            "options": ["用事", "時間", "祭り", "趣味"],
            "correct": "用事",
            "explanation": "用事 (youji) significa 'asunto / compromiso pendiente', la razón cortés tradicional para declinar."
        }
    ],
    13: [
        {
            "id": "m13_ex1",
            "question": "¿Cómo preguntas en la calle si hay un cajero automático cercano?",
            "sentence": "この近くに [___] はありますか？",
            "options": ["ATM", "交番", "駅", "公園"],
            "correct": "ATM",
            "explanation": "ATM (ē-tī-emu) se utiliza en todo Japón para cajeros bancarios automáticos."
        },
        {
            "id": "m13_ex2",
            "question": "¿Cómo describes por teléfono tu ubicación en un punto de encuentro urbano?",
            "sentence": "今、駅の前の [___] の近くにいます。",
            "options": ["交差点", "電車", "改札口", "非常口"],
            "correct": "交差点",
            "explanation": "交差点 (こうさてん / kousaten) significa intersección o cruce de calles."
        },
        {
            "id": "m13_ex3",
            "question": "¿Qué cartel avisa que hoy es el día de descanso regular del comercio?",
            "sentence": "ドアに「本日 [___] 」と書いてあります。",
            "options": ["定休日", "営業中", "満席", "受付"],
            "correct": "定休日",
            "explanation": "定休日 (ていきゅうび / teikyuubi) indica el día de cierre regular o de descanso semanal."
        }
    ],
    14: [
        {
            "id": "m14_ex1",
            "question": "¿Cómo preguntas al dependiente en qué planta está la sección de electrónica?",
            "sentence": "家電製品は何 [___] にございますか？",
            "options": ["階", "番", "本", "枚"],
            "correct": "階",
            "explanation": "Para indicar las plantas de un edificio se utiliza el contador 階 (かい / がい)."
        },
        {
            "id": "m14_ex2",
            "question": "¿Cómo preguntas si es posible pagar con tarjeta usando la forma potencial?",
            "sentence": "クレジットカードは [___] か？",
            "options": ["使えます", "買います", "払います", "持ちます"],
            "correct": "使えます",
            "explanation": "使えます (tsukaemasu) es la forma potencial de 使う (usar): '¿Se puede utilizar?'"
        },
        {
            "id": "m14_ex3",
            "question": "¿Qué indicación en una puerta de tienda significa 'Tirar / Jalar'?",
            "sentence": "ドアの取っ手に「 [___] 」と表示されています。",
            "options": ["引く", "押す", "開く", "止まれ"],
            "correct": "引く",
            "explanation": "引く (ひく / hiku) significa 'Tirar/Jalar', opuesto a 押す (おす / empujar)."
        }
    ],
    15: [
        {
            "id": "m15_ex1",
            "question": "¿Cómo anuncia el cajero el total a pagar al terminar la compra?",
            "sentence": "お [___] は、ぜんぶで3,450円になります。",
            "options": ["会計", "釣り", "金", "財布"],
            "correct": "会計",
            "explanation": "お会計 (おかいけい / okaikei) es el término cortés usado por los dependientes para la cuenta total."
        },
        {
            "id": "m15_ex2",
            "question": "¿Cómo pides una cantidad de peso exacta en una carnicería?",
            "sentence": "豚肉を300 [___] ください。",
            "options": ["グラム", "キロ", "メートル", "ミリ"],
            "correct": "グラム",
            "explanation": "グラム (guramu) es la unidad estándar en japonés para el peso en carnicerías y fiambrerías."
        },
        {
            "id": "m15_ex3",
            "question": "¿Cómo indicas educadamente en el combini que no necesitas bolsa de plástico?",
            "sentence": "レジ袋は [___] です。このままでいいです。",
            "options": ["いらない", "ほしい", "温め", "大丈夫"],
            "correct": "大丈夫",
            "explanation": "袋は大丈夫です / 結構です es la respuesta cortés más habitual para declinar una bolsa plástica."
        }
    ],
    19: [
        {
            "id": "m19_ex1",
            "question": "¿Cómo expresas tu meta de superación diciendo 'Quiero mejorar y hablar mejor japonés'?",
            "sentence": "日本語がもっと [___] なりたいです。",
            "options": ["上手に", "上手な", "上手で", "上手"],
            "correct": "上手に",
            "explanation": "Con adjetivos-na y el verbo なる (volverse), se utiliza に: 上手になります / 上手になりたい."
        },
        {
            "id": "m19_ex2",
            "question": "¿Cómo le deseas buena salud a un profesor o anfitrión al despedirte de Japón?",
            "sentence": "先生もお [___] で。またいつか会いましょう！",
            "options": ["元気", "安心", "便利", "丁寧"],
            "correct": "元気",
            "explanation": "お元気で (ogenki de) es la expresión canónica de despedida que desea salud y bienestar duradero."
        },
        {
            "id": "m19_ex3",
            "question": "¿Cómo pides los datos de contacto para seguir comunicándose?",
            "sentence": "連絡 [___] を教えてください。メッセージを送ります。",
            "options": ["先", "人", "所", "手"],
            "correct": "先",
            "explanation": "連絡先 (れんらくさき / renrakusaki) significa 'información / datos de contacto'."
        }
    ]
}

# Inject exercises
count_added = 0
for mod in modules:
    step = mod.get("step")
    if step in new_exercises:
        existing_ids = {e["id"] for e in mod.get("exercises", [])}
        for ex in new_exercises[step]:
            if ex["id"] not in existing_ids:
                mod.setdefault("exercises", []).append(ex)
                count_added += 1

with open("data/curriculum.json", "w", encoding="utf-8") as f:
    json.dump(modules, f, ensure_ascii=False, indent=2)

print(f"Enriched data/curriculum.json with {count_added} targeted exercises!")
total_ex = sum(len(m.get("exercises", [])) for m in modules)
print(f"Total exercises in curriculum.json now: {total_ex}")
