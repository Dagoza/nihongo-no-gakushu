#!/usr/bin/env python3
import json

# Data for 22 Irodori dialogues (3 exercises each: reply, missing_word, missing_kanji)
irodori_exercises = [
    # Dialogue 1
    {
        "id": "conv_ex_iro_1_1",
        "lesson": None,
        "dialogue_id": "iro_diag_1",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "En la sharehouse, Tanaka te saluda: 「あ、田中です。よろしくお願いします。どちらからですか？」 ¿Cuál es la respuesta adecuada para indicar tu país de origen?",
        "context": "田中: あ、田中です。よろしくお願いします。どちらからですか？\nTú: 【 ？ 】",
        "correct": "ブラジルから来ました。",
        "options": [
            "ブラジルから来ました。",
            "ブラジルへ行きます。",
            "ブラジルに住んでいます。",
            "ブラジルが好きです。"
        ],
        "explanation": "Para responder a la pregunta sobre el país de procedencia se utiliza la fórmula [País] + から来ました (kara kimashita: 'vengo de...')."
    },
    {
        "id": "conv_ex_iro_1_2",
        "lesson": None,
        "dialogue_id": "iro_diag_1",
        "type": "missing_word",
        "type_label": "Completar gramática",
        "prompt_es": "Completa la frase de Marcia: 'Todavía no hablo muy bien japonés.'",
        "context": "まだ日本語があまり上手【 ？ 】ありません。",
        "correct": "じゃ",
        "options": ["じゃ", "を", "に", "で"],
        "explanation": "La negación formal de los adjetivos-na como 上手 (じょうず) es 上手じゃありません (o 上手ではありません)."
    },
    {
        "id": "conv_ex_iro_1_3",
        "lesson": None,
        "dialogue_id": "iro_diag_1",
        "type": "missing_kanji",
        "type_label": "Expresión en contexto",
        "prompt_es": "¿Qué expresión humilde y cortés usa Tanaka ante un elogio ('No, qué va / En absoluto')?",
        "context": "田中: 【 ？ 】、とても上手ですよ。困ったことがあったら何でも聞いてくださいね。",
        "correct": "いえいえ",
        "options": ["いえいえ", "はいはい", "さようなら", "どうもありがとう"],
        "explanation": "「いえいえ」 es la expresión coloquial y educada estándar en Japón para declinar humildemente un cumplido."
    },

    # Dialogue 2
    {
        "id": "conv_ex_iro_2_1",
        "lesson": None,
        "dialogue_id": "iro_diag_2",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "En un izakaya, el camarero pregunta si han decidido el pedido: 「いらっしゃいませ！ご注文はお決まりですか？」 ¿Qué respondes para ordenar?",
        "context": "店員: いらっしゃいませ！ご注文はお決まりですか？\nTú: 【 ？ 】",
        "correct": "はい。この焼き鳥セットを二つと、烏龍茶を一つください。",
        "options": [
            "はい。この焼き鳥セットを二つと、烏龍茶を一つください。",
            "いいえ、食べませんでした。",
            "お会計をお願いします。",
            "ごちそうさまでした。"
        ],
        "explanation": "Para pedir raciones en un restaurante se usa [Plato] + を + [Número] + ください."
    },
    {
        "id": "conv_ex_iro_2_2",
        "lesson": None,
        "dialogue_id": "iro_diag_2",
        "type": "missing_word",
        "type_label": "Completar partícula",
        "prompt_es": "¿Qué partícula marca el objeto directo en el pedido del combo de comida?",
        "context": "この焼き鳥セット【 ？ 】二つと、烏龍茶を一つください。",
        "correct": "を",
        "options": ["を", "は", "に", "で"],
        "explanation": "La partícula を (wo) marca el objeto directo de la acción de pedir o recibir."
    },
    {
        "id": "conv_ex_iro_2_3",
        "lesson": None,
        "dialogue_id": "iro_diag_2",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Qué kanji completa la fórmula de cortesía del dependiente 'Espere un momento, por favor'?",
        "context": "店員: はい、喜んで！【 ？ 】お待ちください。",
        "correct": "少々",
        "options": ["少々", "時々", "日々", "年々"],
        "explanation": "少々 (しょうしょう) significa 'un momento / un poco', parte de la fórmula formal 少々お待ちください."
    },

    # Dialogue 3
    {
        "id": "conv_ex_iro_3_1",
        "lesson": None,
        "dialogue_id": "iro_diag_3",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Tu senpai te pide fotocopiar 5 documentos: 「この会議の資料を五枚コピーして、ホチキスで留めてください。」 ¿Cuál es la confirmación adecuada?",
        "context": "先輩: この会議の資料を五枚コピーして、ホチキスで留めてください。\n後輩: 【 ？ 】",
        "correct": "分かりました。カラーですか、白黒ですか？",
        "options": [
            "分かりました。カラーですか、白黒ですか？",
            "いいえ、やりたくありません。",
            "会議は中止になりました。",
            "お疲れ様でした。"
        ],
        "explanation": "Confirmar la tarea y consultar detalles necesarios (color o blanco y negro) demuestra proactividad y cortesía profesional."
    },
    {
        "id": "conv_ex_iro_3_2",
        "lesson": None,
        "dialogue_id": "iro_diag_3",
        "type": "missing_word",
        "type_label": "Contador adecuado",
        "prompt_es": "¿Qué contador se utiliza para contar hojas de papel o documentos impresos?",
        "context": "この書類を五【 ？ 】コピーしてください。",
        "correct": "枚",
        "options": ["枚", "本", "台", "個"],
        "explanation": "枚 (まい) es el contador para objetos planos y delgados, como hojas de papel, fotos o platos."
    },
    {
        "id": "conv_ex_iro_3_3",
        "lesson": None,
        "dialogue_id": "iro_diag_3",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Qué término en kanji designa la 'sala de reuniones' donde debes entregar las copias?",
        "context": "白黒で大丈夫です。できたら二階の【 ？ 】に持ってきてください。",
        "correct": "会議室",
        "options": ["会議室", "事務室", "図書室", "教室"],
        "explanation": "会議室 (かいぎしつ) está compuesto por 会議 (reunión) y 室 (sala/habitación)."
    },

    # Dialogue 4
    {
        "id": "conv_ex_iro_4_1",
        "lesson": None,
        "dialogue_id": "iro_diag_4",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Anna te invita al festival de fuegos artificiales: 「隅田川で花火大会があるんです。いっしょに行きませんか？」 ¿Cómo aceptas con entusiasmo?",
        "context": "アンナ: 隅田川で花火大会があるんです。いっしょに行きませんか？\nケン: 【 ？ 】",
        "correct": "いいね！ぜひ行こう。何時にどこで待ち合わせする？",
        "options": [
            "いいね！ぜひ行こう。何時にどこで待ち合わせする？",
            "花火はきらいです。",
            "明日からテストがあります。",
            "初めまして、よろしくお願いします。"
        ],
        "explanation": "「いいね！ぜひ行こう」 (¡Qué bien! Vayamos sin falta) es la fórmula informal entusiasta de aceptación."
    },
    {
        "id": "conv_ex_iro_4_2",
        "lesson": None,
        "dialogue_id": "iro_diag_4",
        "type": "missing_word",
        "type_label": "Completar fórmula de invitación",
        "prompt_es": "Completa la terminación verbal cortés para invitar a alguien a hacer algo juntos: '¿Vamos juntos?'",
        "context": "いっしょに行き【 ？ 】か？",
        "correct": "ません",
        "options": ["ません", "ました", "ます", "ましょう"],
        "explanation": "〜ませんか es la estructura estándar y cortés para proponer o invitar a alguien a realizar una acción conjunta."
    },
    {
        "id": "conv_ex_iro_4_3",
        "lesson": None,
        "dialogue_id": "iro_diag_4",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Qué kanji compone el término 'festival de fuegos artificiales'?",
        "context": "今週末の【 ？ 】に行きませんか？",
        "correct": "花火大会",
        "options": ["花火大会", "運動会", "音楽会", "文化祭"],
        "explanation": "花火大会 (はなびたいかい): 花火 (fuegos artificiales) + 大会 (gran evento / festival)."
    },

    # Dialogue 5
    {
        "id": "conv_ex_iro_5_1",
        "lesson": None,
        "dialogue_id": "iro_diag_5",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Preguntas al jefe de estación cómo ir a Shinjuku: 「すみません、新宿に行きたいんですが、何番線ですか？」 ¿Qué te indica?",
        "context": "乗客: すみません、新宿に行きたいんですが、何番線ですか？\n駅員: 【 ？ 】",
        "correct": "新宿でしたら、二番線の山手線内回りにご乗車ください。",
        "options": [
            "新宿でしたら、二番線の山手線内回りにご乗車ください。",
            "新宿行きの切符は売り切れました。",
            "タクシーに乗ってください。",
            "改札を出てください。"
        ],
        "explanation": "El empleado de estación indica el andén (二番線) y la dirección de la línea (山手線内回り)."
    },
    {
        "id": "conv_ex_iro_5_2",
        "lesson": None,
        "dialogue_id": "iro_diag_5",
        "type": "missing_word",
        "type_label": "Completar partícula",
        "prompt_es": "¿Qué partícula acompaña al verbo de subir/montar a un medio de transporte (乗る)?",
        "context": "新宿駅へは何番線【 ？ 】乗ればいいですか？",
        "correct": "に",
        "options": ["に", "を", "で", "へ"],
        "explanation": "El verbo 乗る (noru - subir/montar a un transporte) rige siempre la partícula に."
    },
    {
        "id": "conv_ex_iro_5_3",
        "lesson": None,
        "dialogue_id": "iro_diag_5",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Cómo se escribe en kanji 'tren rápido'?",
        "context": "次は【 ？ 】ですか、各駅停車ですか？",
        "correct": "快速",
        "options": ["快速", "特急", "急行", "普通"],
        "explanation": "快速 (かいそく) significa 'servicio rápido', que se salta estaciones secundarias en contraste con 各駅停車."
    },

    # Dialogue 6
    {
        "id": "conv_ex_iro_6_1",
        "lesson": None,
        "dialogue_id": "iro_diag_6",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "En la caja del combini, el cajero pregunta: 「レジ袋はご利用になりますか？」 Si no necesitas bolsa, ¿qué respondes?",
        "context": "店員: レジ袋はご利用になりますか？\n客: 【 ？ 】",
        "correct": "いいえ、袋はいりません。このままでいいです。",
        "options": [
            "いいえ、袋はいりません。このままでいいです。",
            "はい、袋を捨ててください。",
            "カードでお願いします。",
            "温めてください。"
        ],
        "explanation": "「袋はいりません。このままでいいです」 (No necesito bolsa. Así tal cual está bien) es la frase habitual en tiendas."
    },
    {
        "id": "conv_ex_iro_6_2",
        "lesson": None,
        "dialogue_id": "iro_diag_6",
        "type": "missing_word",
        "type_label": "Completar expresión",
        "prompt_es": "¿Qué palabra falta para pedir que calienten el plato preparado?",
        "context": "お弁当、【 ？ 】をお願いします。",
        "correct": "温め",
        "options": ["温め", "冷まし", "包み", "運び"],
        "explanation": "温め (あたため) es el sustantivo derivado de 温める (calentar en microondas en combinis)."
    },
    {
        "id": "conv_ex_iro_6_3",
        "lesson": None,
        "dialogue_id": "iro_diag_6",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Qué kanji corresponde al verbo 'pagar' (はらう)?",
        "context": "交通系ICカードで【 ？ 】います。",
        "correct": "払",
        "options": ["払", "買", "売", "貸"],
        "explanation": "払う (はらう) significa pagar (aquí en forma cortés: 払います)."
    },

    # Dialogue 7
    {
        "id": "conv_ex_iro_7_1",
        "lesson": None,
        "dialogue_id": "iro_diag_7",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Tu colega Sato te pregunta qué te parece el nuevo jefe: 「新しい課長はどう？優しそうな方でしょう？」 ¿Cuál es la respuesta adecuada?",
        "context": "佐藤: 新しい課長はどう？優しそうな方でしょう？\nリー: 【 ？ 】",
        "correct": "はい、とても真面目そうで、話しやすそうな方で安心しました。",
        "options": [
            "はい、とても真面目そうで、話しやすそうな方で安心しました。",
            "いいえ、課長は昨日辞めました。",
            "来週から旅行に行きます。",
            "お腹がいっぱいです。"
        ],
        "explanation": "Confirmar la impresión positiva usando la estructura de apariencia 〜そう (parece responsable y cercano)."
    },
    {
        "id": "conv_ex_iro_7_2",
        "lesson": None,
        "dialogue_id": "iro_diag_7",
        "type": "missing_word",
        "type_label": "Estructura gramatical",
        "prompt_es": "Completa la frase para expresar que acabas de llegar recientemente a Japón:",
        "context": "先週、日本に来た【 ？ 】なので、まだ見るもの全部が新鮮です。",
        "correct": "ばかり",
        "options": ["ばかり", "ところ", "はず", "わけ"],
        "explanation": "Forma verbal en pasado (た) + ばかり indica que una acción acaba de realizarse hace poco tiempo."
    },
    {
        "id": "conv_ex_iro_7_3",
        "lesson": None,
        "dialogue_id": "iro_diag_7",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Qué kanji completa la expresión 'fácil de hablar con él' (話しやすい)?",
        "context": "とても真面目そうで、【 ？ 】やすそうな方で安心しました。",
        "correct": "話し",
        "options": ["話し", "聞き", "読み", "書き"],
        "explanation": "話しやすい (はなしやすい) = raíz del verbo 話す (hablar) + やすい (fácil de)."
    },

    # Dialogue 8
    {
        "id": "conv_ex_iro_8_1",
        "lesson": None,
        "dialogue_id": "iro_diag_8",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Tienes alergia al huevo y pides cambiar un plato: 「卵アレルギーがあるので、別のものに変えてもらえますか？」 ¿Cómo responde el camarero?",
        "context": "客: 実は卵アレルギーがあるので、卵が食べられないんです。何か別のものに変えてもらえますか？\n店員: 【 ？ 】",
        "correct": "かしこまりました。冷奴に変更いたしますね。",
        "options": [
            "かしこまりました。冷奴に変更いたしますね。",
            "いいえ、絶対に無理です。",
            "卵をたくさん入れますね。",
            "ごちそうさまでした。"
        ],
        "explanation": "「かしこまりました」 (entendido perfectamente) y ofrecer una alternativa segura (冷奴, tofu frío) es la respuesta cortés del personal."
    },
    {
        "id": "conv_ex_iro_8_2",
        "lesson": None,
        "dialogue_id": "iro_diag_8",
        "type": "missing_word",
        "type_label": "Conector de causa",
        "prompt_es": "¿Qué conector cortés de causa/motivo se usa para justificar que no puedes comer algo?",
        "context": "卵アレルギーがある【 ？ 】、卵が食べられないんです。",
        "correct": "ので",
        "options": ["ので", "のに", "ても", "なら"],
        "explanation": "ので expresa causa objetiva y educada, muy adecuado al dar explicaciones a personal de atención al cliente."
    },
    {
        "id": "conv_ex_iro_8_3",
        "lesson": None,
        "dialogue_id": "iro_diag_8",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Cómo se escribe el término que designa el 'plato pequeño/cuenco de acompañamiento' (こばち)?",
        "context": "すみません、この定食の【 ？ 】には卵が入っていますか？",
        "correct": "小鉢",
        "options": ["小鉢", "大鉢", "小皿", "大皿"],
        "explanation": "小鉢 (こばち): 小 (pequeño) + 鉢 (cuenco de cerámica)."
    },

    # Dialogue 9
    {
        "id": "conv_ex_iro_9_1",
        "lesson": None,
        "dialogue_id": "iro_diag_9",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Comentas que quieres viajar a Kioto en el puente festivo: 「来月の連休に京都へ行こうと思っているんです。」 ¿Qué consejo te da tu compañero?",
        "context": "アンナ: 来月の連休に京都へ行こうと思っているんです。\n同僚: 【 ？ 】",
        "correct": "紅葉の季節の京都は最高だよ！でも混むから早く予約したほうがいいよ。",
        "options": [
            "紅葉の季節の京都は最高だよ！でも混むから早く予約したほうがいいよ。",
            "京都には電車が通っていませんよ。",
            "絶対にホテルを予約してはいけません。",
            "パスポートを忘れないでください。"
        ],
        "explanation": "El compañero alaba la temporada de hojas otoñales y recomienda reservar con anticipación debido a la multitud."
    },
    {
        "id": "conv_ex_iro_9_2",
        "lesson": None,
        "dialogue_id": "iro_diag_9",
        "type": "missing_word",
        "type_label": "Estructura de recomendación",
        "prompt_es": "Completa la fórmula verbal para dar un consejo ('es mejor que reserves pronto'):",
        "context": "新幹線と宿は早く予約した【 ？ 】いいですよ。",
        "correct": "ほう",
        "options": ["ほう", "わけ", "ため", "こと"],
        "explanation": "Forma pasada (た) + ほうがいい (hou ga ii) es la estructura estándar para sugerir o aconsejar una acción."
    },
    {
        "id": "conv_ex_iro_9_3",
        "lesson": None,
        "dialogue_id": "iro_diag_9",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Qué palabra describe que una zona es 'cómoda/conveniente' (べんり) para hospedarse?",
        "context": "地下鉄の駅に近いエリアが【 ？ 】でおすすめだよ。",
        "correct": "便利",
        "options": ["便利", "不便", "静か", "危険"],
        "explanation": "便利 (べんり) significa conveniente, práctico o bien comunicado."
    },

    # Dialogue 10
    {
        "id": "conv_ex_iro_10_1",
        "lesson": None,
        "dialogue_id": "iro_diag_10",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "En la organización del festival, preguntas qué pasará si llueve: 「もし明日雨が降ったら、屋外のステージはどうなりますか？」 ¿Qué responde el responsable?",
        "context": "ボランティア: もし明日雨が降ったら、屋外のステージはどうなりますか？\n責任者: 【 ？ 】",
        "correct": "雨が降ったら、隣の公民館の大ホールに移動することになっています。",
        "options": [
            "雨が降ったら、隣の公民館の大ホールに移動することになっています。",
            "雨が降っても傘を差してはいけません。",
            "全員で海に泳ぎに行きます。",
            "ステージはそのまま放置します。"
        ],
        "explanation": "La norma prevista se expresa con ことになっています ('está establecido que nos traslademos al gran auditorio')."
    },
    {
        "id": "conv_ex_iro_10_2",
        "lesson": None,
        "dialogue_id": "iro_diag_10",
        "type": "missing_word",
        "type_label": "Condicional",
        "prompt_es": "¿Qué partícula condicional completa la frase 'si llueve' (雨が降ったら)?",
        "context": "明日雨が降っ【 ？ 】、どうしますか？",
        "correct": "たら",
        "options": ["たら", "なら", "ば", "ても"],
        "explanation": "〜たら es el condicional temporal/hipotético ('si/cuando ocurra...')."
    },
    {
        "id": "conv_ex_iro_10_3",
        "lesson": None,
        "dialogue_id": "iro_diag_10",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Cómo se escribe en kanji 'mapa' (ちず)?",
        "context": "屋台がどこに設置されるか、【 ？ 】で確認できますか？",
        "correct": "地図",
        "options": ["地図", "図書", "地球", "地下"],
        "explanation": "地図 (ちず) se compone de 地 (tierra/suelo) y 図 (dibujo/plano)."
    },

    # Dialogue 11
    {
        "id": "conv_ex_iro_11_1",
        "lesson": None,
        "dialogue_id": "iro_diag_11",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "En la tienda de electrónica preguntas si pueden rebajar el precio: 「少し予算オーバーで…これ、少し安くなりますか？」 ¿Qué oferta te hace el vendedor?",
        "context": "客: 少し予算オーバーで…これ、少し安くなりますか？\n店員: 【 ？ 】",
        "correct": "本日ご購入いただけるなら、ポイントを10％お付けできますよ！",
        "options": [
            "本日ご購入いただけるなら、ポイントを10％お付けできますよ！",
            "絶対に値引きはしません。お帰りください。",
            "もっと高い商品を買いましょう。",
            "掃除機は売り切れました。"
        ],
        "explanation": "En las tiendas japonesas de electrodomésticos es común compensar con puntos de compra adicionales (ポイント) en lugar de bajar el precio base directo."
    },
    {
        "id": "conv_ex_iro_11_2",
        "lesson": None,
        "dialogue_id": "iro_diag_11",
        "type": "missing_word",
        "type_label": "Sufijo de facilidad",
        "prompt_es": "¿Qué sufijo indica que un aparato es 'fácil de mover' (動かしやすい)?",
        "context": "本体がとても軽くて動かし【 ？ 】ですよ。",
        "correct": "やすい",
        "options": ["やすい", "にくい", "がたい", "づらい"],
        "explanation": "Raíz del verbo (動かし) + やすい significa 'fácil de realizar la acción'."
    },
    {
        "id": "conv_ex_iro_11_3",
        "lesson": None,
        "dialogue_id": "iro_diag_11",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Qué kanji designa el electrodoméstico 'aspiradora' (そうじき)?",
        "context": "コードレスの【 ？ 】を探しているんですが、おすすめはありますか？",
        "correct": "掃除機",
        "options": ["掃除機", "洗濯機", "扇風機", "印刷機"],
        "explanation": "掃除機 (そうじき): 掃除 (limpieza) + 機 (máquina/aparato)."
    },

    # Dialogue 12
    {
        "id": "conv_ex_iro_12_1",
        "lesson": None,
        "dialogue_id": "iro_diag_12",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "El peluquero te consulta qué estilo deseas: 「本日はどのような髪型にいたしましょうか？」 ¿Cómo le pides un corte específico?",
        "context": "美容師: 本日はどのような髪型にいたしましょうか？\n客: 【 ？ 】",
        "correct": "全体的に長さを揃えて、前髪は眉毛が見えるくらい短く切ってもらえますか？",
        "options": [
            "全体的に長さを揃えて、前髪は眉毛が見えるくらい短く切ってもらえますか？",
            "髪の毛を全部剃ってください。",
            "何も切らないでください。",
            "シャンプーだけ飲みたいです。"
        ],
        "explanation": "Explicar el corte general y especificar la longitud deseada para el flequillo (前髪) con 〜てもらえますか."
    },
    {
        "id": "conv_ex_iro_12_2",
        "lesson": None,
        "dialogue_id": "iro_diag_12",
        "type": "missing_word",
        "type_label": "Petición de beneficio",
        "prompt_es": "Completa la frase para pedir que te aligeren el volumen del cabello: 'Me gustaría que me lo descargaran un poco.'",
        "context": "重くなっているので、少しすいて軽くして【 ？ 】たいです。",
        "correct": "もらい",
        "options": ["もらい", "あげ", "くれ", "やり"],
        "explanation": "〜てもらいたい expresa el deseo de que la otra persona realice una acción en favor del hablante."
    },
    {
        "id": "conv_ex_iro_12_3",
        "lesson": None,
        "dialogue_id": "iro_diag_12",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Cómo se escribe en kanji 'flequillo' (まえがみ)?",
        "context": "【 ？ 】を眉毛が見えるくらい短く切ってください。",
        "correct": "前髪",
        "options": ["前髪", "後髪", "黒髪", "白髪"],
        "explanation": "前髪 (まえがみ): 前 (adelante / frente) + 髪 (cabello)."
    },

    # Dialogue 13
    {
        "id": "conv_ex_iro_13_1",
        "lesson": None,
        "dialogue_id": "iro_diag_13",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "En el simulacro, un empleado pregunta: 「揺れている最中に火を消しに行ってもいいですか？」 ¿Qué ordena el instructor?",
        "context": "従業員: 揺れている最中に火を消しに行ってもいいですか？\n指導員: 【 ？ 】",
        "correct": "いいえ、まずは机の下に潜って頭を守るのが最優先です。",
        "options": [
            "いいえ、まずは机の下に潜って頭を守るのが最優先です。",
            "はい、急いで外に飛び出してください。",
            "エレベーターに乗って避難してください。",
            "窓を全部閉めて待機してください。"
        ],
        "explanation": "En caso de terremoto en Japón, protegerse la cabeza bajo una mesa firme es la prioridad absoluta antes de intentar apagar fogones."
    },
    {
        "id": "conv_ex_iro_13_2",
        "lesson": None,
        "dialogue_id": "iro_diag_13",
        "type": "missing_word",
        "type_label": "Prohibición cortés",
        "prompt_es": "Completa la instrucción para pedir serenidad: 'Bajo ningún concepto entren en pánico.'",
        "context": "大きな揺れが来ても、決して慌て【 ？ 】でください。",
        "correct": "ない",
        "options": ["ない", "なく", "ず", "ぬ"],
        "explanation": "La estructura de petición negativa cortés es [Verbo en forma nai] + でください (慌てないでください)."
    },
    {
        "id": "conv_ex_iro_13_3",
        "lesson": None,
        "dialogue_id": "iro_diag_13",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Qué término en kanji designa el 'simulacro de prevención de desastres' (ぼうさいくんれん)?",
        "context": "ただ今から【 ？ 】を始めます。",
        "correct": "防災訓練",
        "options": ["防災訓練", "避難所", "消防署", "安全策"],
        "explanation": "防災訓練 (ぼうさいくんれん): 防災 (prevención de desastres) + 訓練 (entrenamiento/simulacro)."
    },

    # Dialogue 14
    {
        "id": "conv_ex_iro_14_1",
        "lesson": None,
        "dialogue_id": "iro_diag_14",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "En tu fiesta de despedida tras 3 años, tu jefe te pide unas palabras de agradecimiento: ¿Qué respondes con emoción y cortesía?",
        "context": "部長: カルロスさん、三年間の勤務本当にお疲れ様でした。一言ご挨拶をお願いします。\nカルロス: 【 ？ 】",
        "correct": "皆様には本当に親切にしていただき、心から感謝しております。",
        "options": [
            "皆様には本当に親切にしていただき、心から感謝しております。",
            "早く家に帰りたいです。",
            "給料が安すぎました。",
            "明日からまた出勤します。"
        ],
        "explanation": "Agradecer la amabilidad recibida con 心から感謝しております ('les agradezco de todo corazón')."
    },
    {
        "id": "conv_ex_iro_14_2",
        "lesson": None,
        "dialogue_id": "iro_diag_14",
        "type": "missing_word",
        "type_label": "Expresión de intención",
        "prompt_es": "Completa la frase para expresar tu plan a futuro: 'Pienso crear mi propia empresa.'",
        "context": "将来は自分の貿易会社を作ろうと【 ？ 】ています！",
        "correct": "思っ",
        "options": ["思っ", "考え", "決め", "知っ"],
        "explanation": "Forma volitiva (作ろう) + と思っています expresa una intención o plan que se viene madurando."
    },
    {
        "id": "conv_ex_iro_14_3",
        "lesson": None,
        "dialogue_id": "iro_diag_14",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Cómo se escribe en kanji 'gratitud / agradecimiento sincero' (かんしゃ)?",
        "context": "皆様の温かいご支援に、心から【 ？ 】しております。",
        "correct": "感謝",
        "options": ["感謝", "感激", "感動", "感心"],
        "explanation": "感謝 (かんしゃ): 感 (sentimiento) + 謝 (agradecer/disculpar)."
    },

    # Dialogue 15
    {
        "id": "conv_ex_iro_15_1",
        "lesson": None,
        "dialogue_id": "iro_diag_15",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Alice te pregunta qué significa exactamente el término de moda 'Oshikatsu': 「『推し活』って、具体的には何のことでしたっけ？」 ¿Cómo se lo explicas?",
        "context": "アリス: 最近よく耳にする「推し活」って、具体的には何のことでしたっけ？\nケンタ: 【 ？ 】",
        "correct": "自分が熱心に応援しているアイドルやキャラを推す活動全般のことだよ。",
        "options": [
            "自分が熱心に応援しているアイドルやキャラを推す活動全般のことだよ。",
            "就職活動の新しい略称だよ。",
            "神社でおみくじを引くことだよ。",
            "朝早くジョギングする健康法だよ。"
        ],
        "explanation": "推し活 (oshikatsu) abarca todas las actividades dedicadas a apoyar a un ídolo, cantante o personaje predilecto."
    },
    {
        "id": "conv_ex_iro_15_2",
        "lesson": None,
        "dialogue_id": "iro_diag_15",
        "type": "missing_word",
        "type_label": "Partícula de tópico coloquial",
        "prompt_es": "¿Qué partícula coloquial se usa para introducir un tema o pedir su definición ('Eso de...')?",
        "context": "推し活【 ？ 】何のことでしたっけ？",
        "correct": "って",
        "options": ["って", "では", "とは", "など"],
        "explanation": "〜って es la variante coloquial viva de 〜というのは / 〜とは para definir conceptos en conversación natural."
    },
    {
        "id": "conv_ex_iro_15_3",
        "lesson": None,
        "dialogue_id": "iro_diag_15",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Cómo se escribe 'cine / sala de cine' (えいがかん) en kanji?",
        "context": "大好きなアニメ映画を何度も【 ？ 】で観るのが好きです。",
        "correct": "映画館",
        "options": ["映画館", "図書館", "美術館", "博物館"],
        "explanation": "映画館 (えいがかん): 映画 (película) + 館 (edificio/recinto público)."
    },

    # Dialogue 16
    {
        "id": "conv_ex_iro_16_1",
        "lesson": None,
        "dialogue_id": "iro_diag_16",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Llamas a la agencia administradora del edificio y te preguntan el problema: 「どのような状態でしょうか？」 ¿Cómo explicas la avería del aire acondicionado?",
        "context": "管理会社: キム様、お電話ありがとうございます。どのような状態でしょうか？\n入居者: 【 ？ 】",
        "correct": "電源は入るのですが、冷たい風が全く出なくて部屋が冷えないんです。",
        "options": [
            "電源は入るのですが、冷たい風が全く出なくて部屋が冷えないんです。",
            "テレビのリモコンが見つかりません。",
            "家賃を安くしてください。",
            "お風呂のお湯がとても気持ちいいです。"
        ],
        "explanation": "Describir el síntoma concreto (enciende pero no echa aire frío ni enfría) utilizando el conector のですが y la explicación 〜んです."
    },
    {
        "id": "conv_ex_iro_16_2",
        "lesson": None,
        "dialogue_id": "iro_diag_16",
        "type": "missing_word",
        "type_label": "Conjetura cotidiana",
        "prompt_es": "Completa la frase para expresar que 'parece que' el aire acondicionado está fallando:",
        "context": "エアコンの調子が悪い【 ？ 】なんですが…",
        "correct": "みたい",
        "options": ["みたい", "らしい", "そう", "はず"],
        "explanation": "〜みたいなんです expresa conjetura suave basada en sensaciones o hechos observados directamente."
    },
    {
        "id": "conv_ex_iro_16_3",
        "lesson": None,
        "dialogue_id": "iro_diag_16",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Qué término en kanji significa 'gestionar / enviar / coordinar a un técnico' (てはい)?",
        "context": "修理業者を【 ？ 】していただけないでしょうか？",
        "correct": "手配",
        "options": ["手配", "配達", "案内", "連絡"],
        "explanation": "手配 (てはい) se refiere a coordinar, tramitar y preparar el envío de un servicio o personal técnico."
    },

    # Dialogue 17
    {
        "id": "conv_ex_iro_17_1",
        "lesson": None,
        "dialogue_id": "iro_diag_17",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Tu colega te pregunta qué precauciones tomas al cocinar para mantenerte sana: 「何か気をつけていることとかある？」 ¿Cuál es tu respuesta?",
        "context": "同僚: えらいなあ。何か気をつけていることとかある？\nマルシア: 【 ？ 】",
        "correct": "塩分と油を控えめにして、具だくさんのお味噌汁を必ず飲むようにしています。",
        "options": [
            "塩分と油を控えめにして、具だくさんのお味噌汁を必ず飲むようにしています。",
            "毎晩カップラーメンだけを食べています。",
            "運動は一切しないようにしています。",
            "朝ごはんは昼過ぎに食べます。"
        ],
        "explanation": "Explicar hábitos saludables moderando sal y grasa (控えめにして) y procurando tomar sopa de miso nutritiva."
    },
    {
        "id": "conv_ex_iro_17_2",
        "lesson": None,
        "dialogue_id": "iro_diag_17",
        "type": "missing_word",
        "type_label": "Hábito procurado",
        "prompt_es": "Completa la estructura para indicar el esfuerzo habitual de cocinar en casa a diario:",
        "context": "外食を減らして、毎日自炊する【 ？ 】にしています。",
        "correct": "よう",
        "options": ["よう", "そう", "こと", "はず"],
        "explanation": "Verbo en forma diccionario + ようにしている indica la determinación y hábito constante de realizar una acción."
    },
    {
        "id": "conv_ex_iro_17_3",
        "lesson": None,
        "dialogue_id": "iro_diag_17",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Cómo se escribe en kanji 'verduras' (やさい)?",
        "context": "外食が続くと【 ？ 】不足になるので、自炊しています。",
        "correct": "野菜",
        "options": ["野菜", "生菜", "野草", "果物"],
        "explanation": "野菜 (やさい): 野 (campo silvestre) + 菜 (vegetal/hortaliza comestible)."
    },

    # Dialogue 18
    {
        "id": "conv_ex_iro_18_1",
        "lesson": None,
        "dialogue_id": "iro_diag_18",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "En la biblioteca o cafetería, alguien pregunta si puede sentarse a tu lado: 「恐れ入ります、座ってもかまいませんか？」 ¿Cómo cedes el asiento amablemente?",
        "context": "学生A: 恐れ入ります、こちらの隣の席は空いていますか？座ってもかまいませんか？\n学生B: 【 ？ 】",
        "correct": "あ、どうぞ。荷物をどけますね。",
        "options": [
            "あ、どうぞ。荷物をどけますね。",
            "ここは私の専用席なので座らないでください。",
            "席を予約するには1000円かかります。",
            "もうすぐ帰るのでダメです。"
        ],
        "explanation": "Responder con amabilidad diciendo 「あ、どうぞ」 y retirar el bolso o mochila para hacer sitio (荷物をどけますね)."
    },
    {
        "id": "conv_ex_iro_18_2",
        "lesson": None,
        "dialogue_id": "iro_diag_18",
        "type": "missing_word",
        "type_label": "Pedir permiso cortés",
        "prompt_es": "Completa la fórmula formal para pedir permiso ('¿Le importaría si me siento?'):",
        "context": "隣に座っ【 ？ 】かまいませんか？",
        "correct": "ても",
        "options": ["ても", "たら", "でも", "のに"],
        "explanation": "Forma te + もかまいませんか es la forma clásica para solicitar permiso sin incomodar al interlocutor."
    },
    {
        "id": "conv_ex_iro_18_3",
        "lesson": None,
        "dialogue_id": "iro_diag_18",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Qué palabra en kanji significa 'sin reparo / con toda confianza' (えんりょなく)?",
        "context": "コンセントは共用ですので【 ？ 】なくお使いください。",
        "correct": "遠慮",
        "options": ["遠慮", "配慮", "考慮", "心遣い"],
        "explanation": "遠慮 (えんりょ) significa reserva, timidez o reparo; 遠慮なく significa 'con toda confianza / sin cortarse'."
    },

    # Dialogue 19
    {
        "id": "conv_ex_iro_19_1",
        "lesson": None,
        "dialogue_id": "iro_diag_19",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Un anciano cae al suelo y un transeúnte te pregunta si está consciente: 「大変だ！意識はありますか？」 ¿Cuál es la respuesta de urgencia?",
        "context": "通行人: 大変だ！意識はありますか？\n目撃者: 【 ？ 】",
        "correct": "呼びかけに応じません！すぐに119番に電話して救急車を呼んでほしいんです！",
        "options": [
            "呼びかけに応じません！すぐに119番に電話して救急車を呼んでほしいんです！",
            "とても気持ちよさそうに眠っていますよ。",
            "警察署に行って免許証を更新しましょう。",
            "今日は天気が良くて暖かいですね。"
        ],
        "explanation": "Indicar que no responde y pedir auxilio inmediato para llamar al 119 (teléfono de ambulancias y bomberos en Japón)."
    },
    {
        "id": "conv_ex_iro_19_2",
        "lesson": None,
        "dialogue_id": "iro_diag_19",
        "type": "missing_word",
        "type_label": "Pedir acción urgente",
        "prompt_es": "Completa la expresión para rogar que la otra persona llame a la ambulancia:",
        "context": "すぐに119番に電話して、救急車を呼んで【 ？ 】んです！",
        "correct": "ほしい",
        "options": ["ほしい", "あげたい", "もらいたい", "やりたい"],
        "explanation": "Forma te + ほしいんです expresa la petición apremiante de que otra persona realice esa acción urgente."
    },
    {
        "id": "conv_ex_iro_19_3",
        "lesson": None,
        "dialogue_id": "iro_diag_19",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Cómo se escribe en kanji 'sangre' (ち)?",
        "context": "お年寄りが転倒して頭から【 ？ 】を流しています！",
        "correct": "血",
        "options": ["血", "皿", "汗", "涙"],
        "explanation": "血 (ち) es el kanji de sangre."
    },

    # Dialogue 20
    {
        "id": "conv_ex_iro_20_1",
        "lesson": None,
        "dialogue_id": "iro_diag_20",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Un invitado felicita al novio en su boda: 「本日はご結婚誠におめでとうございます。心よりお祝い申し上げます。」 ¿Cómo agradece el novio?",
        "context": "招待客: 本日はご結婚誠におめでとうございます。心よりお祝い申し上げます。\n新郎: 【 ？ 】",
        "correct": "ありがとうございます！遠くから来てくださって本当に感謝しています。",
        "options": [
            "ありがとうございます！遠くから来てくださって本当に感謝しています。",
            "いいえ、結婚なんてしたくありませんでした。",
            "ご祝儀を早く出してください。",
            "さようなら、もう二度と会えませんね。"
        ],
        "explanation": "Agradecer la presencia de los invitados y su largo viaje con 遠くから来てくださって本当に感謝しています."
    },
    {
        "id": "conv_ex_iro_20_2",
        "lesson": None,
        "dialogue_id": "iro_diag_20",
        "type": "missing_word",
        "type_label": "Keigo ceremonial",
        "prompt_es": "Completa la fórmula ceremonial japonesa para felicitar solemnemente de todo corazón:",
        "context": "心よりお祝い【 ？ 】上げます。",
        "correct": "申し",
        "options": ["申し", "言い", "話し", "伝え"],
        "explanation": "お祝い申し上げる (お祝いもうしあげる) es la forma humilde formal (Kenjougo) de ofrecer una felicitación solemne."
    },
    {
        "id": "conv_ex_iro_20_3",
        "lesson": None,
        "dialogue_id": "iro_diag_20",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Cómo se escribe en kanji el 'banquete / fiesta nupcial' (ひろうえん)?",
        "context": "お二人の末永いお幸せをお祈りしております。素晴らしい【 ？ 】ですね！",
        "correct": "披露宴",
        "options": ["披露宴", "送別会", "新年会", "懇親会"],
        "explanation": "披露宴 (ひろうえん): 披露 (dar a conocer públicamente) + 宴 (banquete/celebración nupcial)."
    },

    # Dialogue 21
    {
        "id": "conv_ex_iro_21_1",
        "lesson": None,
        "dialogue_id": "iro_diag_21",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "Yuki pide recomendación para viajar a Kyushu en el puente: 「どこがおすすめ？」 ¿Qué destaca Ken?",
        "context": "ユキ: 次の連休に九州に行こうと思っているんだけど、どこがおすすめ？\nケン: 【 ？ 】",
        "correct": "鹿児島が最高だよ！フェリーに乗って目の前から噴煙を上げる桜島を見てみたいと思わない？",
        "options": [
            "鹿児島が最高だよ！フェリーに乗って目の前から噴煙を上げる桜島を見てみたいと思わない？",
            "九州は年中吹雪だからスキー場しかありません。",
            "どこにも行かずに家で寝ていたほうがいいよ。",
            "パスポートがないと九州に入国できません。"
        ],
        "explanation": "Ken recomienda Kagoshima por las vistas del volcán Sakurajima desde el ferry."
    },
    {
        "id": "conv_ex_iro_21_2",
        "lesson": None,
        "dialogue_id": "iro_diag_21",
        "type": "missing_word",
        "type_label": "Deseo de experimentar",
        "prompt_es": "Completa la expresión para indicar que deseas probar a ver el volcán por ti mismo:",
        "context": "フェリーから迫力ある桜島を見て【 ？ 】んです。",
        "correct": "みたい",
        "options": ["みたい", "やすい", "にくい", "たがる"],
        "explanation": "Forma te + みたいんです expresa el deseo personal de experimentar o vivenciar algo por primera vez."
    },
    {
        "id": "conv_ex_iro_21_3",
        "lesson": None,
        "dialogue_id": "iro_diag_21",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Qué término en kanji designa las 'columnas de humo/ceniza volcánica' (ふんえん)?",
        "context": "目の前から【 ？ 】を上げる桜島は圧巻の景色です。",
        "correct": "噴煙",
        "options": ["噴煙", "火事", "煙突", "火山"],
        "explanation": "噴煙 (ふんえん): 噴 (arrojar/erupcionar) + 煙 (humo)."
    },

    # Dialogue 22
    {
        "id": "conv_ex_iro_22_1",
        "lesson": None,
        "dialogue_id": "iro_diag_22",
        "type": "reply",
        "type_label": "¿Qué responder?",
        "prompt_es": "En la entrevista de trabajo, el entrevistador te pregunta tu motivación: 「志望動機をお聞かせいただけますか？」 ¿Cuál es la respuesta profesional adecuada?",
        "context": "面接官: 志望動機をお聞かせいただけますか？\n応募者: 【 ？ 】",
        "correct": "母国での物流業務の経験と日本での語学力を活かし、貴社の国際事業に貢献させていただければ幸いです。",
        "options": [
            "母国での物流業務の経験と日本での語学力を活かし、貴社の国際事業に貢献させていただければ幸いです。",
            "給料さえ高ければどんな仕事でも構いません。",
            "面接は緊張するので早く終わりにしてください。",
            "友達に誘われたので特に理由はありません。"
        ],
        "explanation": "Exponer fortalezas profesionales previas y expresar el deseo de contribuir a la empresa con la fórmula formal 貢献させていただければ幸いです."
    },
    {
        "id": "conv_ex_iro_22_2",
        "lesson": None,
        "dialogue_id": "iro_diag_22",
        "type": "missing_word",
        "type_label": "Cortesía condicional",
        "prompt_es": "Completa la fórmula formal humilde para solicitar la oportunidad de trabajar: '...si me permitiesen trabajar':",
        "context": "こちらの部署で働かせていただけれ【 ？ 】幸いです。",
        "correct": "ば",
        "options": ["ば", "たら", "なら", "ても"],
        "explanation": "〜ていただければ幸いです (〜te itadakereba saiwai desu) es la fórmula estándar de máxima cortesía condicional en negocios en Japón."
    },
    {
        "id": "conv_ex_iro_22_3",
        "lesson": None,
        "dialogue_id": "iro_diag_22",
        "type": "missing_kanji",
        "type_label": "Kanji en contexto",
        "prompt_es": "¿Qué palabra del principio corporativo 'Hou-Ren-So' designa el acto de 'reportar/informar el avance' (ほうこく)?",
        "context": "日々の進捗について小まめに【 ？ 】と連絡を徹底いたします。",
        "correct": "報告",
        "options": ["報告", "相談", "連絡", "通知"],
        "explanation": "報告 (ほうこく) es el 'Hou' de la regla de oro corporativa japonesa 報・連・相 (報告・連絡・相談)."
    }
]

def main():
    with open('data/conversation_exercises.json', 'r', encoding='utf-8') as f:
        existing = json.load(f)

    print(f'Initial existing exercises: {len(existing)}')

    # Ensure all NHK exercises have dialogue_id: 'nhk_l_X'
    for ex in existing:
        if ex.get('lesson') and not ex.get('dialogue_id'):
            ex['dialogue_id'] = f"nhk_l_{ex['lesson']}"

    # Filter out any existing irodori exercises if re-running
    nhk_only = [ex for ex in existing if not ex.get('id', '').startswith('conv_ex_iro_')]
    print(f'NHK exercises: {len(nhk_only)}')

    combined = nhk_only + irodori_exercises
    print(f'Total combined exercises: {len(combined)}')

    with open('data/conversation_exercises.json', 'w', encoding='utf-8') as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)

    print('Successfully updated data/conversation_exercises.json!')

if __name__ == '__main__':
    main()
