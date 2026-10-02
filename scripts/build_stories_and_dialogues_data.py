#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_stories_and_dialogues_data.py
Genera los datasets canónicos de:
1. data/stories.json: 4 historias multicapítulo progresivas (N5, N4, N3) con desglose oracional, audio y traducción al español.
2. data/irodori_dialogues.json: 24 diálogos situacionales oficiales clasificados por nivel JLPT (N5, N4, N3) y vinculados a los módulos de curriculum.json.
3. Actualiza data/curriculum.json con los arrays 'related_dialogues' y 'related_stories' en cada módulo.
"""

import json
import re

def clean_for_ime(text):
    return re.sub(r'[、。！？「」\s\(\)（）]', '', text).strip()

# -------------------------------------------------------------------------
# 1. ACTUALIZAR Y ENRIQUECER HISTORIAS (data/stories.json)
# -------------------------------------------------------------------------

with open("data/stories.json", "r", encoding="utf-8") as f:
    existing_stories = json.load(f)

# Historia 1: Enriquecer con metadata y capítulos
story_1 = existing_stories[0]
story_1["difficulty"] = "N5"
story_1["category"] = "Vida Cotidiana y Rutina"
story_1["source_modules"] = [1, 3, 5, 8]
story_1["title_es"] = "Un día en Japón (私の日本での生活)"

# Asignar capítulo a cada oración de story_1
chapter_ranges = {
    1: (0, 12),
    2: (12, 26),
    3: (26, 40),
    4: (40, len(story_1["sentences"]))
}
for ch, (start, end) in chapter_ranges.items():
    for sent in story_1["sentences"][start:end]:
        sent["chapter"] = ch
        if "translation_es" not in sent:
            sent["translation_es"] = sent.get("english", "")

# Historia 2: N5 - 東京での新しい暮らし (Nueva vida en Tokio)
story_2 = {
    "id": "story_2",
    "title": "東京での新しい暮らし",
    "title_en": "New Life in Tokyo",
    "title_es": "Nueva Vida en Tokio (Compartir piso, compras y festivales)",
    "difficulty": "N5",
    "category": "Vida Urbana y Adaptación",
    "source_modules": [4, 6, 12, 13, 14, 15],
    "description": "Crónica entrañable sobre la llegada a una casa compartida en Tokio, la compra de alimentos en supermercados y combinis, la orientación en el metro y la mágica noche de un festival de verano.",
    "paragraphs": [
        {
            "chapter": 1,
            "title": "シェアハウスでの新しい生活 (Vida en la casa compartida)",
            "japanese": "私は先週から、東京のシェアハウスに住んでいます。リビングルームには大きなテレビとソファがあります。ルームメイトは田中さんとマルシアさんです。田中さんは日本人で、会社員です。マルシアさんはブラジルから来ました。毎日みんなで楽しく話します。",
            "hiragana": "わたしは せんしゅうから、とうきょうの しぇあはうすに すんでいます。りびんぐるーむには おおきな てれびと そふぁーが あります。るーむめいとは たなかさんと まるしあさんです。たなかさんは にほんじんで、かいしゃいんです。まるしあさんは ぶらじるから きました。まいにち みんなで たのしく はなします。",
            "translation_es": "Desde la semana pasada vivo en una casa compartida en Tokio. En la sala de estar hay una televisión grande y un sofá. Mis compañeros de piso son el señor Tanaka y Marcia. El señor Tanaka es japonés y empleado de oficina. Marcia vino de Brasil. Todos los días conversamos alegremente juntos."
        },
        {
            "chapter": 2,
            "title": "スーパーでの買い物と料理 (Compras en el supermercado y cocina)",
            "japanese": "昨日の夕方、駅の近くのスーパーへ行きました。野菜と果物と肉を買いました。日本のスーパーはとても広くて、品物が多いです。会計の時、店員さんが「袋はいりますか」と聞きました。私は「いいえ、袋はいりません」と答えました。夜はみんなでカレーを作って食べました。",
            "hiragana": "きのうの ゆうがた、えきの ちかくの すーぱーへ いきました。やさいと くだものと にくを かいました。にほんの すーぱーは とても ひろくて、しなものが おおいです。かいけいの とき、てんいんさんが「ふくろは いりますか」と ききました。わたしは「いいえ、ふくろは いりません」と こたえました。よるは みんなで かれーを つくって たべました。",
            "translation_es": "Ayer al atardecer fui al supermercado cerca de la estación. Compré verduras, fruta y carne. Los supermercados japoneses son muy amplios y tienen gran variedad de productos. Al pagar, el cajero preguntó: '¿Desea bolsa?'. Respondí: 'No, no necesito bolsa'. Por la noche preparamos curry entre todos y comimos juntos."
        },
        {
            "chapter": 3,
            "title": "地下鉄に乗って秋葉原へ (En metro hacia Akihabara)",
            "japanese": "土曜日に、電車に乗って秋葉原に行きました。新宿駅から黄色い総武線に乗りました。電車の中はとても静かでした。秋葉原の電気街には高いビルがたくさんあります。大きな店で新しいイヤホンを買いました。道に迷いましたが、交番のお巡りさんが親切に教えてくれました。",
            "hiragana": "どようびに、でんしゃに のって あきはばらに いきました。しんじゅくえきから きいろい そうぶせんに のりました。でんしゃの なかは とても しずかでした。あきはばらの でんきがいには たかい びるが たくさん あります。おおきな みせで あたらしい いやほんを かいました。みちに まよいましたが、こうばんの おまわりさんが しんせつに おしえて くれました。",
            "translation_es": "El sábado tomé el tren y fui a Akihabara. Tomé la línea amarilla Sobu desde la estación de Shinjuku. Dentro del tren había mucho silencio. En el barrio tecnológico de Akihabara hay muchísimos edificios altos. Compré unos auriculares nuevos en una tienda grande. Me perdí por el camino, pero el policía del Kōban me indicó amablemente la ruta."
        },
        {
            "chapter": 4,
            "title": "下町の夏祭りと花火 (El festival de verano y los fuegos artificiales)",
            "japanese": "日曜日には、近くの神社でお祭りがありました。大勢の人が浴衣を着て歩いていました。屋台でたこ焼きと焼きそばを買いました。とても美味しかったです。夜八時になると、空にきれいな花火が上がりました。日本の夏の夜は本当に素晴らしい思い出になりました。",
            "hiragana": "にちようびには、ちかくの じんじゃで おまつりが ありました。おおぜいの ひとが ゆかたを きて あるいていました。やたいで たこやきと やきそばを かいました。とても おいしかったです。よる はちじに なると、そらに きれいな はなびが あがりました。にほんの なつの よるは ほんとうに すばらしい おもいでに なりました。",
            "translation_es": "El domingo hubo un festival en el santuario cercano. Mucha gente caminaba vistiendo yukata. Compré takoyaki y yakisoba en los puestos callejeros. Estaban deliciosos. A las ocho de la noche, hermosos fuegos artificiales se elevaron hacia el cielo. La noche de verano en Japón se convirtió en un recuerdo verdaderamente maravilloso."
        }
    ],
    "sentences": [
        # Cap 1
        {"id": "s2_1", "chapter": 1, "japanese": "私は先週から、東京のシェアハウスに住んでいます。", "translation_es": "Desde la semana pasada vivo en una casa compartida en Tokio.", "grammar_note": "〜から indica punto de partida temporal ('desde'). 〜に住んでいます expresa estado de residencia habitual con forma ている.", "clean_target": clean_for_ime("私は先週から東京のシェアハウスに住んでいます")},
        {"id": "s2_2", "chapter": 1, "japanese": "リビングルームには大きなテレビとソファがあります。", "translation_es": "En la sala de estar hay una televisión grande y un sofá.", "grammar_note": "Partícula と une sustantivos en lista exhaustiva. があります denota existencia de objetos inanimados.", "clean_target": clean_for_ime("リビングルームには大きなテレビとソファがあります")},
        {"id": "s2_3", "chapter": 1, "japanese": "ルームメイトは田中さんとマルシアさんです。", "translation_es": "Mis compañeros de piso son el señor Tanaka y Marcia.", "grammar_note": "Cópula です afirma la identidad cortés de los sujetos.", "clean_target": clean_for_ime("ルームメイトは田中さんとマルシアさんです")},
        {"id": "s2_4", "chapter": 1, "japanese": "田中さんは日本人で、会社員です。", "translation_es": "El señor Tanaka es japonés y es empleado de oficina.", "grammar_note": "La forma て de la cópula (で) enlaza dos oraciones nominales coordinadas.", "clean_target": clean_for_ime("田中さんは日本人で会社員です")},
        {"id": "s2_5", "chapter": 1, "japanese": "マルシアさんはブラジルから来ました。", "translation_es": "Marcia vino de Brasil.", "grammar_note": "Partícula から marca procedencia u origen geográfico con el verbo 来ました.", "clean_target": clean_for_ime("マルシアさんはブラジルから来ました")},
        {"id": "s2_6", "chapter": 1, "japanese": "毎日みんなで楽しく話します。", "translation_es": "Todos los días conversamos alegremente juntos.", "grammar_note": "楽しく es la forma adverbial del adjetivo い 楽しい (divertido/alegre).", "clean_target": clean_for_ime("毎日みんなで楽しく話します")},
        # Cap 2
        {"id": "s2_7", "chapter": 2, "japanese": "昨日の夕方、駅の近くのスーパーへ行きました。", "translation_es": "Ayer al atardecer fui al supermercado cerca de la estación.", "grammar_note": "Partícula へ o に marca la dirección del desplazamiento con verbos de movimiento.", "clean_target": clean_for_ime("昨日の夕方駅の近くのスーパーへ行きました")},
        {"id": "s2_8", "chapter": 2, "japanese": "野菜と果物と肉を買いました。", "translation_es": "Compré verduras, fruta y carne.", "grammar_note": "Partícula acusativa を marca el objeto directo de la compra.", "clean_target": clean_for_ime("野菜と果物と肉を買いました")},
        {"id": "s2_9", "chapter": 2, "japanese": "日本のスーパーはとても広くて、品物が多いです。", "translation_es": "Los supermercados japoneses son muy amplios y tienen gran variedad de productos.", "grammar_note": "Forma て del adjetivo 広い (広くて) conecta dos características descriptivas.", "clean_target": clean_for_ime("日本のスーパーはとても広くて品物が多いです")},
        {"id": "s2_10", "chapter": 2, "japanese": "会計の時、店員さんが「袋はいりますか」と聞きました。", "translation_es": "Al pagar, el dependiente preguntó: '¿Desea bolsa?'.", "grammar_note": "Partícula と cita textualmente la pregunta formulada por el empleado.", "clean_target": clean_for_ime("会計の時店員さんが袋はいりますかと聞きました")},
        {"id": "s2_11", "chapter": 2, "japanese": "私は「いいえ、袋はいりません」と答えました。", "translation_es": "Respondí: 'No, no necesito bolsa'.", "grammar_note": "Expresión canónica cotidiana en cajas de comercios japoneses para cuidar el medio ambiente.", "clean_target": clean_for_ime("私はいいえ袋はいりませんと答えました")},
        {"id": "s2_12", "chapter": 2, "japanese": "夜はみんなでカレーを作って食べました。", "translation_es": "Por la noche preparamos curry entre todos y comimos.", "grammar_note": "Forma て (作って) une acciones en secuencia cronológica inmediata.", "clean_target": clean_for_ime("夜はみんなでカレーを作って食べました")},
        # Cap 3
        {"id": "s2_13", "chapter": 3, "japanese": "土曜日に、電車に乗って秋葉原に行きました。", "translation_es": "El sábado tomé el tren y fui a Akihabara.", "grammar_note": "El medio de transporte que se aborda se marca con la partícula に (電車に乗る).", "clean_target": clean_for_ime("土曜日に電車に乗って秋葉原に行きました")},
        {"id": "s2_14", "chapter": 3, "japanese": "新宿駅から黄色い総武線に乗りました。", "translation_es": "Tomé la línea amarilla Sobu desde la estación de Shinjuku.", "grammar_note": "新宿駅から indica la estación de partida; 黄色い modifica directamente a 総武線.", "clean_target": clean_for_ime("新宿駅から黄色い総武線に乗りました")},
        {"id": "s2_15", "chapter": 3, "japanese": "電車の中はとても静かでした。", "translation_es": "Dentro del tren había mucho silencio.", "grammar_note": "Pasado cortés del adjetivo な 静か (静かでした).", "clean_target": clean_for_ime("電車の中はとても静かでした")},
        {"id": "s2_16", "chapter": 3, "japanese": "秋葉原の電気街には高いビルがたくさんあります。", "translation_es": "En el barrio tecnológico de Akihabara hay muchísimos edificios altos.", "grammar_note": "La partícula には combina localización espacial y énfasis temático.", "clean_target": clean_for_ime("秋葉原の電気街には高いビルがたくさんあります")},
        {"id": "s2_17", "chapter": 3, "japanese": "道に迷いましたが、交番のお巡りさんが親切に教えてくれました。", "translation_es": "Me perdí por el camino, pero el policía del Kōban me indicó amablemente la ruta.", "grammar_note": "Verbo auxiliar 〜てくれる expresa gratitud por un favor o ayuda recibida de alguien.", "clean_target": clean_for_ime("道に迷いましたが交番のお巡りさんが親切に教えてくれました")},
        # Cap 4
        {"id": "s2_18", "chapter": 4, "japanese": "日曜日には、近くの神社でお祭りがありました。", "translation_es": "El domingo hubo un festival en el santuario cercano.", "grammar_note": "La partícula で marca el lugar donde tiene lugar un evento dinámico (お祭りがある).", "clean_target": clean_for_ime("日曜日には近くの神社でお祭りがありました")},
        {"id": "s2_19", "chapter": 4, "japanese": "大勢の人が浴衣を着て歩いていました。", "translation_es": "Mucha gente caminaba vistiendo yukata.", "grammar_note": "着て (forma て de 着る) unida a 歩いていました describe una acción simultánea en desarrollo.", "clean_target": clean_for_ime("大勢の人が浴衣を着て歩いていました")},
        {"id": "s2_20", "chapter": 4, "japanese": "屋台でたこ焼きと焼きそばを買いました。", "translation_es": "Compré takoyaki y yakisoba en los puestos callejeros.", "grammar_note": "屋台 (yatai) son los puestos ambulantes típicos de festivales.", "clean_target": clean_for_ime("屋台でたこ焼きと焼きそばを買いました")},
        {"id": "s2_21", "chapter": 4, "japanese": "夜八時になると、空にきれいな花火が上がりました。", "translation_es": "A las ocho de la noche, hermosos fuegos artificiales se elevaron hacia el cielo.", "grammar_note": "〜になると expresa una consecuencia temporal fija ('al llegar las ocho').", "clean_target": clean_for_ime("夜八時になると空にきれいな花火が上がりました")}
    ]
}

# Historia 3: N4 - 日本での挑戦と発見 (Desafíos y Descubrimientos en Japón)
story_3 = {
    "id": "story_3",
    "title": "日本での挑戦と発見",
    "title_en": "Challenges and Discoveries in Japan",
    "title_es": "Desafíos y Descubrimientos (Irodori Elementary 2 · JLPT N4)",
    "difficulty": "N4",
    "category": "Autonomía y Convivencia",
    "source_modules": [20, 21, 22, 23, 25, 26, 27, 28],
    "description": "Relato centrado en la independencia cotidiana en Japón: elegir electrodomésticos fáciles de mover, gestionar alergias alimentarias en tabernas, pedir cortes de pelo en la peluquería, afrontar un terremoto con calma y forjar sueños de emprendimiento.",
    "paragraphs": [
        {
            "chapter": 1,
            "title": "日本に来たばかりの日々と電器屋 (Recién llegado y la tienda de electrónica)",
            "japanese": "日本に来たばかりの時は、右も左も分からなくて大変でした。アパートに必要な掃除機を買いに家電量販店へ行きました。店員さんが「この掃除機は軽くて動かしやすいですよ」と勧めてくれました。ポイントカードを出すのを忘れましたが、少し安くしてもらえて嬉しかったです。",
            "hiragana": "にほんに きたばかりの ときは、みぎも ひだりも わからなくて たいへんでした。あぱーとに ひつような そうじきを かいに かでんりょうはんてんへ いきました。てんいんさんが「この そうじきは かるくて うごかしやすいですよ」と すすめて くれました。ぽいんとかーどを だすのを わすれましたが、すこし やすく してもらえて うれしかったです。",
            "translation_es": "Cuando recién acababa de llegar a Japón, no entendía ni la derecha ni la izquierda y fue bastante duro. Fui a una gran tienda de electrodomésticos a comprar una aspiradora necesaria para mi apartamento. El dependiente me recomendó: 'Esta aspiradora es ligera y fácil de mover'. Aunque olvidé presentar la tarjeta de puntos, me alegré mucho de que me hicieran una rebaja."
        },
        {
            "chapter": 2,
            "title": "ラーメン屋での注文とアレルギー (Pedidos en la taberna y alergias)",
            "japanese": "同僚と人気のラーメン屋に行きました。私はエビアレルギーがあるので、海鮮スープのラーメンは食べられないんです。店員さんに相談すると、「こちらは豚骨ベースなので大丈夫ですよ」と教えてくれました。「わさび抜きで」と頼む必要もなく、安心して美味しく食べられました。",
            "hiragana": "どうりょうと にんきの らーめんやに いきました。わたしは えびあれるぎーが あるので、かいせんすーぷの らーめんは たべられないんです。てんいんさんに そうだんすると、「こちらは とんこつべーすなので だいじょうぶですよ」と おしえて くれました。「わさびぬきで」と たのむ ひつようもなく、あんしんして おいしく たべられました。",
            "translation_es": "Fui con un compañero de trabajo a una famosa taberna de ramen. Como tengo alergia a los camarones, no puedo tomar ramen con sopa de mariscos. Al consultarle al mesero, me explicó: 'Este tiene base de caldo de cerdo, así que no hay ningún problema'. No tuve necesidad de pedir 'sin wasabi' y pude comer con tranquilidad y mucho gusto."
        },
        {
            "chapter": 3,
            "title": "突然の雨と地域のお祭り (Lluvia imprevista y el festival de barrio)",
            "japanese": "町内の夏祭り当日、午後から雲行きが怪しくなりました。「雨が降ったら中止になりますか」と係の人に聞くと、「小雨なら体育館で行いますよ」と答えてくれました。夕方から雨が降り出しましたが、屋台が体育館の前に移動して、みんなで盆踊りを楽しむことができました。",
            "hiragana": "ちょうないの なつまつり とうじつ、ごごから くもゆきが あやしくなりました。「あめが ふったら ちゅうしに なりますか」と かかりの ひとに きくと、「こあめなら たいいくかんで おこないますよ」と こたえて くれました。ゆうがたから あめが ふりだしましたが、やたいが たいいくかんの まえに いどうして、みんなで ぼんおどりを たのしむことが できました。",
            "translation_es": "El día del festival de verano de nuestro barrio, el cielo se puso amenazante desde la tarde. Cuando pregunté al encargado: 'Si llueve, ¿se cancelará?', me respondió: 'Si es llovizna suave, lo haremos en el gimnasio cubierto'. Al atardecer empezó a llover, pero los puestos se trasladaron frente al gimnasio y pudimos disfrutar juntos del baile Bon Odori."
        },
        {
            "chapter": 4,
            "title": "美容院と不在票の連絡 (La peluquería y el aviso del cartero)",
            "japanese": "週末、日本の美容院で初めて髪を切りました。「前髪をもう少し短く切ってもらえますか」と希望を伝えると、美容師さんはとても丁寧にカットしてくれました。家に帰るとポストに不在票が入っていたので、ネットですぐに再配達をお願いしました。",
            "hiragana": "しゅうまつ、にほんの びよういんで はじめて かみを きりました。「まえがみを もうすこし みじかく きってもらえますか」と きぼうを つたえると、びようしさんは とても ていねいに かっと して くれました。いえに かえると ぽすとに ふざいひょうが はいっていたので、ねっとで すぐに さいはいたつを おねがいしました。",
            "translation_es": "El fin de semana me corté el pelo por primera vez en una peluquería japonesa. Cuando le transmití mi deseo: '¿Podría cortarme el flequillo un poco más corto?', el estilista me cortó el cabello con gran esmero. Al regresar a casa encontré un aviso de entrega fallida en el buzón, así que solicité de inmediato la reentrega por internet."
        },
        {
            "chapter": 5,
            "title": "緊急地震速報と将来の夢 (Alerta sísmica y proyectos a futuro)",
            "japanese": "ある日の午後、スマートフォンからけたたましい緊急地震速報が鳴り響きました。私は慌てず机の下に入って頭を守りました。揺れが収まった後、同僚たちが声をかけ合って無事を確認しました。日本の安全への配慮に深く感銘を受け、将来はこの国で自分の会社を作ろうと思っています。",
            "hiragana": "あるひの ごご、すまーとふぉんから けたたましい きんきゅうじしんそくほう が なりひびきました。わたしは あわてず つくえの したに はいって あたまを まもりました。ゆれが おさまった のち、どうりょうたちが こえを かけあって ぶじを かくにんしました。にほんの あんぜんへの はいりょに ふかく かんめいを受け、しょうらいは このくにで じぶんの かいしゃを つくろうと おもっています。",
            "translation_es": "Una tarde, una estridente alerta sísmica temprana sonó en mi teléfono. Sin entrar en pánico, me metí debajo de la mesa protegiéndome la cabeza. Una vez que cesó el temblor, los compañeros nos llamamos unos a otros confirmando que todos estábamos a salvo. Quedé profundamente impresionado por la cultura de seguridad de Japón, y en el futuro pienso crear mi propia empresa en este país."
        }
    ],
    "sentences": [
        {"id": "s3_1", "chapter": 1, "japanese": "日本に来たばかりの時は、右も左も分からなくて大変でした。", "translation_es": "Cuando recién acababa de llegar a Japón, no entendía nada y fue muy duro.", "grammar_note": "〜たばかり expresa pasado inmediato subjetivo ('acabar de llegar').", "clean_target": clean_for_ime("日本に来たばかりの時は右も左も分からなくて大変でした")},
        {"id": "s3_2", "chapter": 1, "japanese": "アパートに必要な掃除機を買いに家電量販店へ行きました。", "translation_es": "Fui a una gran tienda de electrodomésticos a comprar una aspiradora necesaria para mi apartamento.", "grammar_note": "Verbo raíz + に行く expresa el propósito de un desplazamiento.", "clean_target": clean_for_ime("アパートに必要な掃除機を買いに家電量販店へ行きました")},
        {"id": "s3_3", "chapter": 1, "japanese": "この掃除機は軽くて動かしやすいですよ。", "translation_es": "Esta aspiradora es ligera y fácil de mover.", "grammar_note": "動かす (mover) en raíz ます + やすい = 動かしやすい (fácil de mover/operar).", "clean_target": clean_for_ime("この掃除機は軽くて動かしやすいですよ")},
        {"id": "s3_4", "chapter": 1, "japanese": "ポイントカードを出すのを忘れましたが、安くしてもらえました。", "translation_es": "Olvidé sacar la tarjeta de puntos, pero me hicieron una rebaja.", "grammar_note": "Verbo diccionario + のを忘れる sustantiva la acción olvidada.", "clean_target": clean_for_ime("ポイントカードを出すのを忘れましたが安くしてもらえました")},
        {"id": "s3_5", "chapter": 2, "japanese": "エビアレルギーがあるので、海鮮スープのラーメンは食べられないんです。", "translation_es": "Como tengo alergia a los camarones, no puedo tomar ramen con sopa de mariscos.", "grammar_note": "〜ので aporta justificación causal objetiva. 食べられない es la forma potencial negativa.", "clean_target": clean_for_ime("エビアレルギーがあるので海鮮スープのラーメンは食べられないんです")},
        {"id": "s3_6", "chapter": 2, "japanese": "こちらは豚骨ベースなので大丈夫ですよ。", "translation_es": "Este tiene base de caldo de cerdo, así que no hay ningún problema.", "grammar_note": "Explicación tranquilizadora de alérgenos por parte del camarero.", "clean_target": clean_for_ime("こちらは豚骨ベースなので大丈夫ですよ")},
        {"id": "s3_7", "chapter": 3, "japanese": "雨が降ったら、お祭りは中止になりますか？", "translation_es": "Si llueve, ¿se cancelará el festival?", "grammar_note": "Condicional 〜たら (降ったら) para plantear hipótesis climáticas futuras.", "clean_target": clean_for_ime("雨が降ったらお祭りは中止になりますか")},
        {"id": "s3_8", "chapter": 3, "japanese": "小雨なら体育館で行いますよ。", "translation_es": "Si es llovizna suave, lo realizaremos en el gimnasio.", "grammar_note": "Condicional なら con sustantivos para brindar alternativas viables.", "clean_target": clean_for_ime("小雨なら体育館で行いますよ")},
        {"id": "s3_9", "chapter": 4, "japanese": "前髪をもう少し短く切ってもらえますか？", "translation_es": "¿Podría cortarme el flequillo un poco más corto?", "grammar_note": "Verbo en forma て + もらえますか formula una petición educada de servicio.", "clean_target": clean_for_ime("前髪をもう少し短く切ってもらえますか")},
        {"id": "s3_10", "chapter": 4, "japanese": "ポストに不在票が入っていたので、ネットですぐに再配達をお願いしました。", "translation_es": "Había una nota de entrega fallida en el buzón, así que pedí la reentrega por la web.", "grammar_note": "Gestión cívica habitual con paquetería postal en Japón.", "clean_target": clean_for_ime("ポストに不在票が入っていたのでネットですぐに再配達をお願いしました")},
        {"id": "s3_11", "chapter": 5, "japanese": "私は慌てず机の下に入って頭を守りました。", "translation_es": "Sin entrar en pánico, me metí bajo la mesa y me protegí la cabeza.", "grammar_note": "慌てず es la forma formal escrita de 慌てないで (sin entrar en pánico).", "clean_target": clean_for_ime("私は慌てず机の下に入って頭を守りました")},
        {"id": "s3_12", "chapter": 5, "japanese": "将来、日本で自分の会社を作ろうと思っています。", "translation_es": "En el futuro pienso crear mi propia empresa en Japón.", "grammar_note": "Forma volitiva 作ろう + と思っている expresa propósitos meditados a mediano plazo.", "clean_target": clean_for_ime("将来日本で自分の会社を作ろうと思っています")}
    ]
}

# Historia 4: N3 - 日本社会で生きる：夢への架け橋 (Vivir en la Sociedad Japonesa)
story_4 = {
    "id": "story_4",
    "title": "日本社会で生きる：夢への架け橋",
    "title_en": "Living in Japanese Society: Bridge to Dreams",
    "title_es": "Vivir en la Sociedad Japonesa (Irodori Pre-Intermediate · JLPT N3)",
    "difficulty": "N3",
    "category": "Inmersión Profesional e Intercultural",
    "source_modules": [29, 30, 31, 32, 35, 36, 37],
    "description": "Crónica intermedia sobre la madurez comunicativa: alquilar un apartamento independiente, preparar cocina regional casera, debates socioculturales con amigos, expedición a Kyushu y la entrevista laboral decisiva con Keigo formal.",
    "paragraphs": [
        {
            "chapter": 1,
            "title": "アパートの契約と引越し (Contrato del piso y mudanza)",
            "japanese": "日本での生活も三年目に入り、念願の一人暮らしを始めることにしました。不動産屋で敷金と礼金が不要な物件を紹介してもらいました。入居した翌日、エアコンのリモコンが故障したみたいで動かなかったのですが、管理会社に連絡したところ、親切に修理業者を手配していただけました。",
            "hiragana": "にほんでの せいかつも さんねんめに はいり、ねんがんの ひとりぐらしを はじめることに しました。ふどうさんやで しききんと れいきんが ふような ぶっけんを しょうかいして もらいました。にゅうきょした よくじつ、えあこんの りもこんが こしょうしたみたいで うごかなかったのですが、かんりがいしゃに れんらくしたところ、しんせつに しゅうりぎょうしゃを てはいして いただけました。",
            "translation_es": "Mi vida en Japón entró en su tercer año y decidí empezar mi anhelada vida independiente. En la inmobiliaria me presentaron un piso que no requería ni fianza ni gratificación al casero (敷金・礼金). Al día siguiente de mudarme, parecía que el mando del aire acondicionado estaba estropeado y no funcionaba, pero al comunicarme con la administración tuvieron la amabilidad de enviarme un técnico de reparaciones."
        },
        {
            "chapter": 2,
            "title": "毎日の自炊と健康管理 (Cocina casera diaria y salud)",
            "japanese": "自立した生活を送るため、毎日の食事は栄養のバランスを考えて自炊するようにしています。仕事で疲れた夜は電子レンジを活用した時短料理を作ります。スーパーで知り合った近所のおばあちゃんから、地元の郷土料理である芋煮の作り方を教えてもらい、日本の伝統の味を実感しました。",
            "hiragana": "じりつした せいかつを おくるため、まいにちの しょくじは えいようの ばらんすを かんがえて じすいするように しています。しごとで つかれた よるは でんしれんじを かつようした じたんりょうりを つくります。すーぱーで しりあった きんじょの おばあちゃんから、じもとの きょうどりょうりである いもにの つくりかたを おしえてもらい、にほんの でんとうの あじを じっかんしました。",
            "translation_es": "Para llevar una vida independiente, me esfuerzo por cocinarme a diario pensando en el equilibrio nutricional. Las noches que llego cansado del trabajo preparo platos rápidos aprovechando el microondas. Una anciana vecina que conocí en el supermercado me enseñó a preparar Imoni, un plato tradicional regional, y experimenté el verdadero sabor tradicional de Japón."
        },
        {
            "chapter": 3,
            "title": "カフェでのオタク談義と友情 (Tertulias de anime y amistad en el café)",
            "japanese": "休日は趣味のサークル仲間とカフェで語り合います。「新作のアニメ映画って、もう観たんだっけ？」と尋ねると、友人が「戦闘シーンの作画が本当に鳥肌が立つほど凄かったよ」と熱く語ってくれました。お互いの価値観を認め合える親友になれたらいいなと心から願っています。",
            "hiragana": "きゅうじつは しゅみの さーくるなかまと かふぇで かたりあいます。「しんさくの あにめえいがって、もう みたんだっけ？」と たずねると、ゆうじんが「せんとうしーんの さくがが ほんとうに とりはだが たつほど すごかったよ」と あつく かたって くれました。おたがいの かちかんを みとめあえる しんゆうに なれたらいいなと こころから ねがっています。",
            "translation_es": "Los días libres me reúno a conversar en una cafetería con compañeros de mi club de aficiones. Cuando pregunté: 'Oye, ¿ya habías visto la nueva película de anime?', mi amigo relató con entusiasmo: 'La animación de las escenas de combate fue tan impresionante que de verdad se me puso la piel de gallina'. Deseo de corazón que podamos ser amigos entrañables que respeten mutuamente sus valores."
        },
        {
            "chapter": 4,
            "title": "九州・桜島への一人旅 (Viaje en solitario a Kyushu y Sakurajima)",
            "japanese": "有給休暇を取って、ずっと憧れていた鹿児島県へ一人旅に出かけました。フェリーから雄大な活火山である桜島を自分の目で見た時は、言葉を失うほどの迫力でした。温泉街の旅館では女将さんに温かくもてなしていただき、素晴らしい旅の思い出をカメラにたくさん収めました。",
            "hiragana": "ゆうきゅうきゅうかを とって、ずっと あこがれていた かごしまけんへ ひとりたびに でかけました。ふぇりーから ゆうだいな かつかざんである さくらじまを じぶんのめで みたときは、ことばを うしなうほどの はくりょくでした。おんせんがいの りょかんでは おかみさんに あたたかく もてなしていただき、すばらしい たびの おもいでを かめらに たくさん おさめました。",
            "translation_es": "Tomé vacaciones retribuidas y salí de viaje en solitario hacia la prefectura de Kagoshima, a la que tanto anhelaba ir. Cuando contemplé con mis propios ojos desde el ferry el majestuoso volcán activo Sakurajima, su imponente presencia me dejó sin palabras. En la posada tradicional de la villa termal la dueña me brindó una cálida hospitalidad, y capturé muchísimos recuerdos maravillosos con mi cámara."
        },
        {
            "chapter": 5,
            "title": "運命の採用面接とこれからの私 (La entrevista laboral formal con Keigo)",
            "japanese": "そして今日、志望していた日系グローバル企業の採用面接に臨みました。緊張しましたが、背筋を伸ばし「これまでの実務経験を活かし、貴社の国際事業に貢献させていただければ幸いです」と堂々と伝えました。面接官の温かい笑顔を見て、これまでの努力が報われたと確信しました。",
            "hiragana": "そして きょう、しぼうしていた にっけい ぐろーばるきぎょうの さいようめんせつに のぞみました。きんちょうしましたが、せすじを のばし「これまでの じつむけいけんを いかし、きしゃの こくさいじぎょうに こうけんさせていただければ さいわいです」と どうどうと つたえました。めんせつかんの あたたかい えがおを みて、これまでの どりょくが むくわれたと かくしんしました。",
            "translation_es": "Y hoy afronté la entrevista de selección en la empresa global japonesa a la que aspiraba ingresar. Estaba nervioso, pero erguí la espalda y transmití con aplomo: 'Aprovechando mi experiencia profesional previa, sería un inmenso honor si me permiten contribuir al área de negocios internacionales de su distinguida empresa'. Al ver la cálida sonrisa del entrevistador, tuve la certeza de que todo mi esfuerzo previo había valido la pena."
        }
    ],
    "sentences": [
        {"id": "s4_1", "chapter": 1, "japanese": "不動産屋で敷金と礼金が不要な物件を紹介してもらいました。", "translation_es": "En la inmobiliaria me presentaron un piso que no requería ni fianza ni gratificación al propietario.", "grammar_note": "敷金 (fianza) y 礼金 (reikin). 〜てもらう expresa recibir un servicio o favor.", "clean_target": clean_for_ime("不動産屋で敷金と礼金が不要な物件を紹介してもらいました")},
        {"id": "s4_2", "chapter": 1, "japanese": "エアコンのリモコンが故障したみたいで動かなかったんです。", "translation_es": "Parecía que el mando del aire acondicionado estaba averiado y no funcionaba.", "grammar_note": "〜みたい expresa conjetura o deducción fundamentada en indicios sensoriales.", "clean_target": clean_for_ime("エアコンのリモコンが故障したみたいで動かなかったんです")},
        {"id": "s4_3", "chapter": 2, "japanese": "毎日の食事は栄養のバランスを考えて自炊するようにしています。", "translation_es": "Intento cocinarme a diario pensando en el equilibrio nutricional.", "grammar_note": "Verbo [Forma Diccionario] + ようにしている denota esfuerzo deliberado y continuo por mantener un hábito positivo.", "clean_target": clean_for_ime("毎日の食事は栄養のバランスを考えて自炊するようにしています")},
        {"id": "s4_4", "chapter": 2, "japanese": "地元の郷土料理である芋煮の作り方を教えてもらいました。", "translation_es": "Me enseñaron a preparar Imoni, un plato tradicional regional.", "grammar_note": "郷土料理 (cocina tradicional regional). 作り方 (forma de elaborar/cocinar).", "clean_target": clean_for_ime("地元の郷土料理である芋煮の作り方を教えてもらいました")},
        {"id": "s4_5", "chapter": 3, "japanese": "新作のアニメ映画って、もう観たんだっけ？", "translation_es": "Oye, y la nueva película de animación, ¿ya la habías visto?", "grammar_note": "〜って marca el foco temático coloquial. 〜んだっけ busca confirmar un dato en la memoria.", "clean_target": clean_for_ime("新作のアニメ映画ってもう観たんだっけ")},
        {"id": "s4_6", "chapter": 3, "japanese": "お互いを認め合える親友になれたらいいなと思っています。", "translation_es": "Espero que podamos ser amigos entrañables que se respeten mutuamente.", "grammar_note": "〜たらいいな expresa un deseo sincero no impositivo hacia el futuro.", "clean_target": clean_for_ime("お互いを認め合える親友になれたらいいなと思っています")},
        {"id": "s4_7", "chapter": 4, "japanese": "活火山である桜島を自分の目で見てみたいんです。", "translation_es": "Quiero ver con mis propios ojos el monte Sakurajima, un volcán activo.", "grammar_note": "Verbo [Forma て] + みたい expresa el anhelo de vivir una experiencia en primera persona.", "clean_target": clean_for_ime("活火山である桜島を自分の目で見てみたいんです")},
        {"id": "s4_8", "chapter": 5, "japanese": "貴社の国際事業に貢献させていただければ幸いです。", "translation_es": "Sería un inmenso honor si me permiten contribuir al negocio internacional de su distinguida empresa.", "grammar_note": "Forma causativa 貢献させる en forma て + いただければ幸いです es la máxima expresión honorífica en entrevistas laborales.", "clean_target": clean_for_ime("貴社の国際事業に貢献させていただければ幸いです")}
    ]
}

all_stories = [story_1, story_2, story_3, story_4]

with open("data/stories.json", "w", encoding="utf-8") as f:
    json.dump(all_stories, f, ensure_ascii=False, indent=2)

print(f"✅ data/stories.json actualizado con {len(all_stories)} historias completas (N5, N4, N3).")

# -------------------------------------------------------------------------
# 2. GENERAR DIÁLOGOS OFICIALES IRODORI (data/irodori_dialogues.json)
# -------------------------------------------------------------------------

irodori_dialogues = [
    # N5 (Starter & Elementary 1)
    {
        "id": "iro_diag_1",
        "dialogue_num": 1,
        "title_jp": "初めまして、よろしくお願いします",
        "title_es": "Saludos vecinales y presentación en la sharehouse",
        "level": "N5",
        "topic": "Vida Cotidiana",
        "series": "Irodori (Fundación Japón)",
        "related_step": 1,
        "situation": "Un nuevo residente extranjero saluda a su vecino de pasillo en el edificio de apartamentos.",
        "characters": ["マルシア", "田中"],
        "dialogue": [
            {"speaker": "マルシア", "jp": "初めまして。隣の部屋に引っ越してきたマルシアです。", "kana": "はじめまして。となりのへやにひっこしてきたまるしあです。", "es": "Mucho gusto. Soy Marcia, me mudé a la habitación de al lado."},
            {"speaker": "田中", "jp": "あ、田中です。よろしくお願いします。どちらからですか？", "kana": "あ、たなかです。よろしくおねがいします。どちらからですか？", "es": "Ah, soy Tanaka. Mucho gusto. ¿De dónde es usted?"},
            {"speaker": "マルシア", "jp": "ブラジルから来ました。まだ日本語があまり上手じゃありません。", "kana": "ぶらじるからきました。まだにほんごがあまりじょうずじゃありません。", "es": "Vengo de Brasil. Todavía no hablo muy bien japonés."},
            {"speaker": "田中", "jp": "いえいえ、とても上手ですよ。困ったことがあったら何でも聞いてくださいね。", "kana": "いえいえ、とてもじょうずですよ。こまったことがあったらなんでもきいてくださいね。", "es": "No, qué va, lo habla muy bien. Si tiene cualquier problema, pregúnteme lo que sea."}
        ],
        "grammar_notes": "Uso de はじめまして para la primera presentación y どちらからですか para indagar procedencia con cortesía."
    },
    {
        "id": "iro_diag_2",
        "dialogue_num": 2,
        "title_jp": "これを二つと烏龍茶をください",
        "title_es": "Pidiendo comida y raciones en una taberna Izakaya",
        "level": "N5",
        "topic": "Vida Cotidiana",
        "series": "Irodori (Fundación Japón)",
        "related_step": 5,
        "situation": "Dos comensales hacen su pedido al camarero en un restaurante tradicional.",
        "characters": ["客", "店員"],
        "dialogue": [
            {"speaker": "店員", "jp": "いらっしゃいませ！ご注文はお決まりですか？", "kana": "いらっしゃいませ！ごちゅうもんはおきまりですか？", "es": "¡Bienvenidos! ¿Han decidido ya su pedido?"},
            {"speaker": "客", "jp": "はい。この焼き鳥セットを二つと、烏龍茶を一つください。", "kana": "はい。このやきとりせっとをふたつと、うーろんちゃをひとつください。", "es": "Sí. Por favor, pónganos dos combos de yakitori y un té oolong."},
            {"speaker": "店員", "jp": "かしこまりました。烏龍茶は氷をお入れしますか？", "kana": "かしこまりました。うーろんちゃはこおりをおいれしますか？", "es": "Muy bien entendido. ¿Le ponemos hielo al té oolong?"},
            {"speaker": "客", "jp": "はい、氷入りでお願いします。あと、お水も二つもらえますか？", "kana": "はい、こおりいりでおねがいします。あと、おみずもふたつもらえますか？", "es": "Sí, con hielo por favor. Además, ¿nos podría traer dos vasos de agua?"},
            {"speaker": "店員", "jp": "はい、喜んで！少々お待ちください。", "kana": "はい、よろこんで！しょうしょうおまちください。", "es": "¡Sí, con mucho gusto! Esperen un momento, por favor."}
        ],
        "grammar_notes": "Contadores nativos japoneses ひとつ, ふたつ con la fórmula de comanda 〜をください."
    },
    {
        "id": "iro_diag_3",
        "dialogue_num": 3,
        "title_jp": "この書類を五枚コピーしてください",
        "title_es": "Instrucciones de trabajo y favores en la oficina",
        "level": "N5",
        "topic": "Trabajo y Normas",
        "series": "Irodori (Fundación Japón)",
        "related_step": 9,
        "situation": "Un supervisor de equipo le explica una tarea urgente a un nuevo empleado.",
        "characters": ["先輩", "後輩"],
        "dialogue": [
            {"speaker": "先輩", "jp": "カルロスさん、ちょっといいですか？", "kana": "かるろすさん、ちょっといいですか？", "es": "Carlos, ¿tienes un momento?"},
            {"speaker": "後輩", "jp": "はい、何でしょうか？", "kana": "はい、なんでしょうか？", "es": "Sí, ¿de qué se trata?"},
            {"speaker": "先輩", "jp": "この会議の資料を五枚コピーして、ホチキスで留めてください。", "kana": "このかいぎのしりょうをごまいこぴーして、ほちきすでとめてください。", "es": "Haz cinco fotocopias de estos documentos de la reunión y grápalos, por favor."},
            {"speaker": "後輩", "jp": "分かりました。カラーですか、白黒ですか？", "kana": "わかりました。からーですか、しろくろですか？", "es": "Entendido. ¿En color o en blanco y negro?"},
            {"speaker": "先輩", "jp": "白黒で大丈夫です。できたら二階の会議室に持ってきてください。", "kana": "しろくろでだいじょうぶです。できたらにかいのかいぎしつにもってきてください。", "es": "En blanco y negro está bien. Cuando termines, tráelos a la sala de reuniones del segundo piso."}
        ],
        "grammar_notes": "Fórmula 〜てください para dar instrucciones laborales claras y amables."
    },
    {
        "id": "iro_diag_4",
        "dialogue_num": 4,
        "title_jp": "今週末の花火大会に行きませんか？",
        "title_es": "Invitación entusiasta al festival de fuegos artificiales",
        "level": "N5",
        "topic": "Ocio y Sociedad",
        "series": "Irodori (Fundación Japón)",
        "related_step": 11,
        "situation": "Dos amigos conversan después de clase para organizar una salida el sábado.",
        "characters": ["アンナ", "ケン"],
        "dialogue": [
            {"speaker": "アンナ", "jp": "ケンさん、今週の土曜日の夜は空いていますか？", "kana": "けんさん、こんしゅうのどようびのよるはあいていますか？", "es": "Ken, ¿estás libre este sábado por la noche?"},
            {"speaker": "ケン", "jp": "ええ、特に予定はないよ。どうしたの？", "kana": "ええ、とくによていはないよ。どうしたの？", "es": "Sí, no tengo planes en particular. ¿Qué pasa?"},
            {"speaker": "アンナ", "jp": "隅田川で花火大会があるんです。いっしょに行きませんか？", "kana": "すみだがわではなびたいかいがあるんです。いっしょにいきませんか？", "es": "Hay un festival de fuegos artificiales en el río Sumida. ¿Vamos juntos?"},
            {"speaker": "ケン", "jp": "いいね！ぜひ行こう。何時にどこで待ち合わせする？", "kana": "いいね！ぜひいこう。なんじにどこでまちあわせする？", "es": "¡Qué bien! Vayamos sin falta. ¿A qué hora y dónde quedamos?"}
        ],
        "grammar_notes": "Invitación cortés con 〜ませんか y aceptación con ぜひ + volitivo."
    },
    {
        "id": "iro_diag_5",
        "dialogue_num": 5,
        "title_jp": "新宿駅へは何番線に乗ればいいですか？",
        "title_es": "Preguntando por andenes y trenes en la estación",
        "level": "N5",
        "topic": "Ciudad y Servicios",
        "series": "Irodori (Fundación Japón)",
        "related_step": 12,
        "situation": "Un usuario consulta con el revisor de estación cuál es el andén correcto.",
        "characters": ["乗客", "駅員"],
        "dialogue": [
            {"speaker": "乗客", "jp": "すみません、新宿に行きたいんですが、何番線ですか？", "kana": "すみません、しんじゅくにいきたいんですが、なんばんせんですか？", "es": "Disculpe, quiero ir a Shinjuku, ¿en qué andén debo tomarlo?"},
            {"speaker": "駅員", "jp": "新宿でしたら、二番線の山手線内回りにご乗車ください。", "kana": "しんじゅくでしたら、にばんせんのやまのてせんうちまわりにごじょうしゃください。", "es": "Si es para Shinjuku, tome la línea Yamanote (sentido interior) en el andén número dos."},
            {"speaker": "乗客", "jp": "次は快速ですか、各駅停車ですか？", "kana": "つぎはかいそくですか、かくえきていしゃですか？", "es": "¿El siguiente es rápido o para en todas las estaciones?"},
            {"speaker": "駅員", "jp": "山手線はすべて各駅停車ですよ。三分後に参ります。", "kana": "やまのてせんはすべてかくえきていしゃですよ。さんぷんごにまいります。", "es": "La línea Yamanote para en todas las estaciones. Llega en tres minutos."}
        ],
        "grammar_notes": "Fórmula 〜たいんですが para solicitar orientación y 何番線 para consultar el andén."
    },
    {
        "id": "iro_diag_6",
        "dialogue_num": 6,
        "title_jp": "袋はいりません。温めをお願いします",
        "title_es": "Compras rutinarias en la caja del combini",
        "level": "N5",
        "topic": "Ciudad y Servicios",
        "series": "Irodori (Fundación Japón)",
        "related_step": 15,
        "situation": "Un cliente compra un bento en la tienda de conveniencia 24h.",
        "characters": ["客", "店員"],
        "dialogue": [
            {"speaker": "店員", "jp": "お弁当、温めますか？", "kana": "おべんとう、あたためますか？", "es": "¿Le caliento el bento?"},
            {"speaker": "客", "jp": "はい、お願いします。", "kana": "はい、おねがいします。", "es": "Sí, por favor."},
            {"speaker": "店員", "jp": "レジ袋はご利用になりますか？", "kana": "れじぶくろはごりようになりますか？", "es": "¿Va a necesitar bolsa de plástico?"},
            {"speaker": "客", "jp": "いいえ、袋はいりません。このままでいいです。", "kana": "いいえ、ふくろはいりません。このままでいいです。", "es": "No, no necesito bolsa. Así tal cual está bien."},
            {"speaker": "店員", "jp": "合計で680円になります。お支払いはどうされますか？", "kana": "ごうけいでろっぴゃくはちじゅうえんになります。おしはらいはどうされますか？", "es": "El total son 680 yenes. ¿Cómo desea pagar?"},
            {"speaker": "客", "jp": "交通系ICカードで払います。", "kana": "こうつうけいあいしーかーどではらいます。", "es": "Pagaré con tarjeta de transporte IC."}
        ],
        "grammar_notes": "Preguntas canónicas de cajeros en Japón: 温め y 袋はいりません."
    },

    # N4 (Elementary 2)
    {
        "id": "iro_diag_7",
        "dialogue_num": 7,
        "title_jp": "先週、日本に来たばかりです",
        "title_es": "Llegada reciente a Japón y conjetura de personalidad con 〜そう",
        "level": "N4",
        "topic": "Vida Cotidiana",
        "series": "Irodori (Fundación Japón)",
        "related_step": 20,
        "situation": "Presentación entre nuevos compañeros de departamento.",
        "characters": ["リー", "佐藤"],
        "dialogue": [
            {"speaker": "佐藤", "jp": "リーさん、日本の生活はどうですか？もう慣れましたか？", "kana": "りーさん、にほんのせいかつはどうですか？もうなれましたか？", "es": "Li, ¿qué tal la vida en Japón? ¿Ya te has acostumbrado?"},
            {"speaker": "リー", "jp": "先週日本に来たばかりなので、まだ見るもの全部が新鮮で驚いています。", "kana": "せんしゅうにほんにきたばかりなので、まだみるものぜんぶがしんせんでおどろいています。", "es": "Como acabo de llegar a Japón la semana pasada, todo lo que veo es nuevo y me asombra."},
            {"speaker": "佐藤", "jp": "新しい課長はどう？優しそうな方でしょう？", "kana": "あたらしいかちょうはどう？やさしかなかたでしょう？", "es": "¿Y qué tal el nuevo jefe de sección? Parece una persona muy amable, ¿verdad?"},
            {"speaker": "リー", "jp": "はい、とても真面目そうで、話しやすそうな方で安心しました。", "kana": "はい、とてもまじめそうで、はなしやすかなかたであんしんしました。", "es": "Sí, parece muy responsable y alguien accesible para hablar, así que me tranquilicé."}
        ],
        "grammar_notes": "〜たばかり (pasado inmediato subjetivo) y 〜そう (conjetura por apariencia)."
    },
    {
        "id": "iro_diag_8",
        "dialogue_num": 8,
        "title_jp": "アレルギーがあるので、食べられないんです",
        "title_es": "Declarando alergias alimentarias en el restaurante",
        "level": "N4",
        "topic": "Vida Cotidiana",
        "series": "Irodori (Fundación Japón)",
        "related_step": 21,
        "situation": "Un cliente consulta los ingredientes de un plato tradicional con el mesero.",
        "characters": ["客", "店員"],
        "dialogue": [
            {"speaker": "客", "jp": "すみません、この定食の小鉢には卵が入っていますか？", "kana": "すみません、このていしょくのこばちにはたまごがはいっていますか？", "es": "Disculpe, ¿este plato pequeño del menú incluye huevo?"},
            {"speaker": "店員", "jp": "はい、茶碗蒸しですので卵を使っております。", "kana": "はい、ちゃわんむしですのでたまごをつかっております。", "es": "Sí, es chawanmushi, por lo que usamos huevo."},
            {"speaker": "客", "jp": "実は卵アレルギーがあるので、卵が食べられないんです。何か別のものに変えてもらえますか？", "kana": "じつはたまごあれるぎーがあるので、たまごがたべられないんです。なにかべつのものにかえてもらえますか？", "es": "En realidad tengo alergia al huevo y no puedo comerlo. ¿Podría cambiármelo por otra cosa?"},
            {"speaker": "店員", "jp": "かしこまりました。冷奴に変更いたしますね。", "kana": "かしこまりました。ひややっこにへんこういたしますね。", "es": "Comprendido perfectamente. Se lo cambiaremos por tofu frío."}
        ],
        "grammar_notes": "〜ので como justificación médica respetuosa y 食べられない como forma potencial negativa."
    },
    {
        "id": "iro_diag_9",
        "dialogue_num": 9,
        "title_jp": "早く予約したほうがいいですよ",
        "title_es": "Consejos para reservar alojamiento y trenes de puente festivo",
        "level": "N4",
        "topic": "Ciudad y Servicios",
        "series": "Irodori (Fundación Japón)",
        "related_step": 22,
        "situation": "Un colega aconseja sobre cómo viajar durante la temporada alta de otoño.",
        "characters": ["同僚", "アンナ"],
        "dialogue": [
            {"speaker": "アンナ", "jp": "来月の連休に京都へ行こうと思っているんです。", "kana": "らいげつのれんきゅうにきょうとへいこうとおもっているんです。", "es": "Pienso ir a Kioto durante los festivos del próximo mes."},
            {"speaker": "同僚", "jp": "紅葉の季節の京都は最高だよ！でもすごく混むから、新幹線と宿は早く予約したほうがいいよ。", "kana": "こうようのきせつのきょうとはさいこうだよ！でもすごくこむから、しんかんせんとやどははやくよやくしたほうがいいよ。", "es": "¡Kioto en época de follaje otoñal es lo máximo! Pero se llena muchísimo, así que es mejor que reserves pronto el Shinkansen y el hotel."},
            {"speaker": "アンナ", "jp": "そうなんですね。どんなエリアに泊まったらいいですか？", "kana": "そうなんですね。どんなえりあにとまったらいいですか？", "es": "Vaya, conque es así. ¿En qué zona me aconsejas hospedarme?"},
            {"speaker": "同僚", "jp": "地下鉄の駅に近い烏丸や河原町のあたりが便利でおすすめだよ。", "kana": "ちかてつのえきにちかいからすまやかわらまちのあたりがべんりでおすすめだよ。", "es": "Cerca de las estaciones de Karasuma o Kawaramachi es muy cómodo y te lo recomiendo."}
        ],
        "grammar_notes": "〜たほうがいい para dar un consejo contundente y 〜たらいいですか para pedir orientación."
    },
    {
        "id": "iro_diag_10",
        "dialogue_num": 10,
        "title_jp": "雨が降ったら、どうしますか？",
        "title_es": "Condicionales e imprevistos en festivales comunitarios",
        "level": "N4",
        "topic": "Ocio y Sociedad",
        "series": "Irodori (Fundación Japón)",
        "related_step": 23,
        "situation": "Voluntarios organizan un festival al aire libre coordinando contingencias por mal tiempo.",
        "characters": ["ボランティア", "責任者"],
        "dialogue": [
            {"speaker": "ボランティア", "jp": "リーダー、もし明日雨が降ったら、屋外のステージはどうなりますか？", "kana": "りーだー、もしあしたあめがふったら、おくがいのすてーじはどうなりますか？", "es": "Líder, si mañana llueve, ¿qué pasará con el escenario al aire libre?"},
            {"speaker": "責任者", "jp": "雨が降ったら、隣の公民館の大ホールに移動することになっています。", "kana": "あめがふったら、となりのこうみんかんのだいほーるにいどうすることになっています。", "es": "Si llueve, está establecido que nos trasladaremos al auditorio del centro cívico contiguo."},
            {"speaker": "ボランティア", "jp": "分かりました。屋台がどこに設置されるか、地図で確認できますか？", "kana": "わかりました。やたいがどこにせっちされるか、ちずでかくにんできますか？", "es": "Entendido. ¿Podemos confirmar en el mapa dónde se ubicarán los puestos?"},
            {"speaker": "責任者", "jp": "受付の掲示板に貼ってありますので、見ておいてください。", "kana": "うけつけのけいじばんにはってありますので、みておいてください。", "es": "Está pegado en el tablón de anuncios de recepción, así que échale un vistazo."}
        ],
        "grammar_notes": "Condicional 〜たら y pregunta indirecta incrustada どこにあるか."
    },
    {
        "id": "iro_diag_11",
        "dialogue_num": 11,
        "title_jp": "この掃除機は軽くて動かしやすいですよ",
        "title_es": "Comparando electrodomésticos y solicitando rebaja",
        "level": "N4",
        "topic": "Ciudad y Servicios",
        "series": "Irodori (Fundación Japón)",
        "related_step": 25,
        "situation": "En una tienda de electrónica, un comprador busca una aspiradora ergonómica.",
        "characters": ["客", "店員"],
        "dialogue": [
            {"speaker": "客", "jp": "コードレスの掃除機を探しているんですが、おすすめはありますか？", "kana": "こーどれすのそうじきをさがしているんですが、おすすめはありますか？", "es": "Busco una aspiradora sin cable, ¿tiene alguna recomendación?"},
            {"speaker": "店員", "jp": "こちらの最新モデルはいかがですか？本体がとても軽くて動かしやすいですよ。", "kana": "こちらのさいしんもでるはいかがですか？ほんたいがとてもかるくてうごかしやすいですよ。", "es": "¿Qué tal este modelo más reciente? El cuerpo es muy ligero y fácil de mover."},
            {"speaker": "客", "jp": "音も静かですね。ただ、少し予算オーバーで…これ、少し安くなりますか？", "kana": "おともしずかですね。ただ、すこしよさんおーばーで…これ、すこしやすくなりますか？", "es": "El ruido también es silencioso. Pero se pasa un poco de mi presupuesto... ¿Se puede rebajar un poco?"},
            {"speaker": "店員", "jp": "本日ご購入いただけるなら、ポイントを10％お付けできますよ！", "kana": "ほんじつごこうにゅういただけるなら、ぽいんとをじゅっぱーせんと おつけできますよ！", "es": "Si la adquiere el día de hoy, ¡podemos abonarle un 10% en puntos!"}
        ],
        "grammar_notes": "Sufijo 〜やすい (facilidad operativa) y fórmula de regateo 安くなりますか."
    },
    {
        "id": "iro_diag_12",
        "dialogue_num": 12,
        "title_jp": "前髪を短く切ってもらえますか？",
        "title_es": "Pidiendo un corte de pelo a medida en la peluquería",
        "level": "N4",
        "topic": "Trabajo y Normas",
        "series": "Irodori (Fundación Japón)",
        "related_step": 26,
        "situation": "En un salón de estética japonés, el cliente detalla el peinado que desea.",
        "characters": ["客", "美容師"],
        "dialogue": [
            {"speaker": "美容師", "jp": "本日はどのような髪型にいたしましょうか？", "kana": "ほんじつはどのようなかみがたにいたしましょうか？", "es": "¿Qué estilo de peinado desea que le hagamos hoy?"},
            {"speaker": "客", "jp": "全体的に長さを揃えて、前髪は眉毛が見えるくらい短く切ってもらえますか？", "kana": "ぜんたいてきにながさをそろえて、まえがみはまゆげがみえるくらいみじかくきってもらえますか？", "es": "¿Podría emparejarme el largo en general y cortarme el flequillo lo bastante corto para que se vean las cejas?"},
            {"speaker": "美容師", "jp": "かしこまりました。サイドのボリュームはいかがなさいますか？", "kana": "かしこまりました。さいどのぼりゅーむはいかがなさいますか？", "es": "Entendido. ¿Qué hacemos con el volumen de los laterales?"},
            {"speaker": "客", "jp": "重くなっているので、少しすいて軽くしてもらいたいです。", "kana": "おもくなっているので、すこしすいてかるくしてもらいたいです。", "es": "Se siente pesado, así que me gustaría que lo descargara un poco para que quede liviano."}
        ],
        "grammar_notes": "Petición de favor técnico con 〜てもらえますか y adjetivo en adverbio 短く."
    },
    {
        "id": "iro_diag_13",
        "dialogue_num": 13,
        "title_jp": "地震が来ても、慌てないでください",
        "title_es": "Instrucciones de seguridad y simulacro de terremoto",
        "level": "N4",
        "topic": "Trabajo y Normas",
        "series": "Irodori (Fundación Japón)",
        "related_step": 27,
        "situation": "Instrucciones de brigadistas durante un simulacro de evacuación ante seísmos.",
        "characters": ["指導員", "従業員"],
        "dialogue": [
            {"speaker": "指導員", "jp": "ただ今から防災訓練を始めます。大きな揺れが来ても、決して慌てないでください。", "kana": "ただいまからぼうさいくんれんをはじめます。おおきなゆれがきても、けっしてあわてないでください。", "es": "Daremos inicio al simulacro de prevención de desastres. Aunque venga una gran sacudida, bajo ningún concepto entren en pánico."},
            {"speaker": "従業員", "jp": "揺れている最中に火を消しに行ってもいいですか？", "kana": "ゆれているさいちゅうにひをけしにいってもいいですか？", "es": "¿Se puede ir a apagar el fuego en medio del temblor?"},
            {"speaker": "指導員", "jp": "いいえ、まずは机の下に潜って頭を守るのが最優先です。揺れが収まってから火を消してください。", "kana": "いいえ、まずはつくえのしたにもぐってあたまをまもるのがさいゆうせんです。ゆれがおさまってからひをけしてください。", "es": "No, primero meterse bajo la mesa y protegerse la cabeza es la máxima prioridad. Apaguen el fuego después de que cese el temblor."}
        ],
        "grammar_notes": "Concesivo 〜ても (来ても) y orden de autoprotección 〜ないでください."
    },
    {
        "id": "iro_diag_14",
        "dialogue_num": 14,
        "title_jp": "将来、自分の会社を作ろうと思っています",
        "title_es": "Discurso emotivo en la fiesta de despedida",
        "level": "N4",
        "topic": "Ocio y Sociedad",
        "series": "Irodori (Fundación Japón)",
        "related_step": 28,
        "situation": "Un empleado agradece a sus colegas en su cena de despedida anunciando sus proyectos futuros.",
        "characters": ["カルロス", "部長"],
        "dialogue": [
            {"speaker": "部長", "jp": "カルロスさん、三年間の勤務本当にお疲れ様でした。一言ご挨拶をお願いします。", "kana": "かるろすさん、さんねんかんのきんむほんとうにおつかれさまでした。ひとことごあいさつをおねがいします。", "es": "Carlos, muchas gracias por tu arduo trabajo en estos tres años. Por favor, dedícanos unas palabras."},
            {"speaker": "カルロス", "jp": "皆様には本当に親切にしていただき、心から感謝しております。日本語も前よりずっと話せるようになりました。", "kana": "みなさまにはほんとうにしんせつにしていただき、こころからかんしゃしております。にほんごもまえよりずっぱなせるようになりました。", "es": "Les agradezco de todo corazón por haberme tratado con tanta amabilidad. Ahora puedo hablar japonés mucho mejor que antes."},
            {"speaker": "カルロス", "jp": "今後はこの経験を活かし、将来は自分の貿易会社を作ろうと思っています！", "kana": "こんごはこのけいけんをいかし、しょうらいはじぶんのぼうえきかいしゃをつくろうとおもっています！", "es": "¡En adelante aprovecharé esta experiencia y en el futuro pienso crear mi propia empresa de comercio exterior!"}
        ],
        "grammar_notes": "Evolución con 〜ようになる y propósito deliberado con la forma volitiva + と思っている."
    },

    # N3 (Pre-Intermediate)
    {
        "id": "iro_diag_15",
        "dialogue_num": 15,
        "title_jp": "推し活って何でしたっけ？",
        "title_es": "Tertulia informal sobre cultura pop y cine con 〜って",
        "level": "N3",
        "topic": "Ocio y Sociedad",
        "series": "Irodori (Fundación Japón)",
        "related_step": 29,
        "situation": "Dos amigos conversan en un café sobre las tendencias y hobbies del momento.",
        "characters": ["ケンタ", "アリス"],
        "dialogue": [
            {"speaker": "アリス", "jp": "最近よく耳にする「推し活」って、具体的には何のことでしたっけ？", "kana": "さいきんよくみみにする「おしかつ」って、ぐたいてきにはなんのことでしたっけ？", "es": "Eso de 'oshikatsu' que se oye tanto últimamente, ¿qué era en concreto?"},
            {"speaker": "ケンタ", "jp": "自分が熱心に応援しているアイドルやアニメキャラを推す活動全般のことだよ。ライブに行ったりグッズを買ったりするんだ。", "kana": "じぶんがねっしんにおうえんしているあいどるやあにめきゃらをおすかつどうぜんぱんのことだよ。らいぶにいったりぐっずをかったりするんだ。", "es": "Se refiere a todas las actividades de apoyo apasionado a tu idol o personaje de anime favorito: ir a conciertos, comprar merchandising..."},
            {"speaker": "アリス", "jp": "なるほど！私も大好きなアニメ映画を何度も映画館で観るのが一番好きだから、立派な推し活ですね。", "kana": "なるほど！わたしもだいすきなあにめえいがをなんどもえいがかんでみるのがいちばんすきだから、りっぱなおしかつですね。", "es": "¡Entendido! Como a mí lo que más me gusta es ver mi película favorita de anime una y otra vez en el cine, ¡también es auténtico oshikatsu!"}
        ],
        "grammar_notes": "Definición coloquial con 〜って, recuerdo con 〜でしたっけ y superlativo con 〜のが一番好き."
    },
    {
        "id": "iro_diag_16",
        "dialogue_num": 16,
        "title_jp": "エアコンが故障したみたいなんですが…",
        "title_es": "Reportando una avería al administrador del edificio",
        "level": "N3",
        "topic": "Vida Cotidiana",
        "series": "Irodori (Fundación Japón)",
        "related_step": 30,
        "situation": "Un inquilino llama por teléfono a la empresa administradora para pedir una reparación.",
        "characters": ["入居者", "管理会社"],
        "dialogue": [
            {"speaker": "入居者", "jp": "お世話になっております。302号室のキムですが、リビングのエアコンの調子が悪いみたいなんです。", "kana": "おせわになっております。さんまるにごうしつのきむですが、りびんぐのえあこんのちょうしがわるいみたいなんです。", "es": "Buenos días. Soy Kim de la habitación 302; parece que el aire acondicionado del salón no funciona bien."},
            {"speaker": "管理会社", "jp": "キム様、お電話ありがとうございます。どのような状態でしょうか？", "kana": "きむさま、おでんわありがとうございます。どのようなじょうたいでしょうか？", "es": "Señor Kim, gracias por llamar. ¿En qué estado se encuentra?"},
            {"speaker": "入居者", "jp": "電源は入るのですが、冷たい風が全く出なくて部屋が冷えないんです。修理業者を手配していただけないでしょうか？", "kana": "でんげんははいるのですが、つめたいかぜがまったくでなくてへやがひえないんです。しゅうりぎょうしゃをてはいしていただけないでしょうか？", "es": "Enciende, pero no sale nada de aire frío y la habitación no se enfría. ¿Sería tan amable de enviarme a un técnico de reparaciones?"},
            {"speaker": "管理会社", "jp": "ご不便をおかけして申し訳ございません。明日の午後に手配いたします。", "kana": "ごふべんをおかけしてもうしわけございません。あすのごごにてはいいたします。", "es": "Lamentamos mucho las molestias. Le enviaremos un técnico mañana por la tarde."}
        ],
        "grammar_notes": "Deducción objetiva con 〜みたい y petición de suma deferencia 〜ていただけないでしょうか."
    },
    {
        "id": "iro_diag_17",
        "dialogue_num": 17,
        "title_jp": "自炊するように気をつけています",
        "title_es": "Conversando sobre nutrición equilibrada y cocina casera",
        "level": "N3",
        "topic": "Vida Cotidiana",
        "series": "Irodori (Fundación Japón)",
        "related_step": 31,
        "situation": "Dos colegas almuerzan juntos hablando de hábitos de salud.",
        "characters": ["同僚", "マルシア"],
        "dialogue": [
            {"speaker": "同僚", "jp": "マルシアさん、いつも美味しそうなお弁当を作ってきてるね！", "kana": "まるしあさん、いつもおいしそうなおべんとうをつくってきてるね！", "es": "¡Marcia, siempre traes un bento que se ve delicioso!"},
            {"speaker": "マルシア", "jp": "ありがとうございます。外食が続くと野菜不足になるので、毎日自炊するようにしているんです。", "kana": "ありがとうございます。がいしょくがつづくとやさいぶそくになるので、まいにちじすいするようにしているんです。", "es": "Gracias. Como comer fuera seguido provoca falta de verduras, procuro cocinar en casa todos los días."},
            {"speaker": "同僚", "jp": "えらいなあ。何か気をつけていることとかある？", "kana": "えらいなあ。なにかきをつけていることとかある？", "es": "Qué admirable. ¿Hay algo en lo que prestes especial atención?"},
            {"speaker": "マルシア", "jp": "塩分と油を控えめにして、具だくさんのお味噌汁を必ず飲むようにしています。", "kana": "えんぶんとあぶらをひかえめにして、ぐだくさんのおみそしるをかならずのむようにしています。", "es": "Modero la sal y el aceite, y me esfuerzo por tomar siempre sopa de miso con abundantes ingredientes."}
        ],
        "grammar_notes": "Formulación de hábitos saludables y esfuerzo consciente con 〜ようにしている."
    },
    {
        "id": "iro_diag_18",
        "dialogue_num": 18,
        "title_jp": "隣に座ってもかまいませんか？",
        "title_es": "Cortesía en espacios públicos y solicitud de permiso",
        "level": "N3",
        "topic": "Vida Cotidiana",
        "series": "Irodori (Fundación Japón)",
        "related_step": 32,
        "situation": "En una biblioteca concurrida, un estudiante pide permiso para ocupar un asiento.",
        "characters": ["学生A", "学生B"],
        "dialogue": [
            {"speaker": "学生A", "jp": "恐れ入ります、こちらの隣の席は空いていますか？座ってもかまいませんか？", "kana": "おそれいります、こちらのとなりのせきはあいていますか？すわってもかまいませんか？", "es": "Disculpe, ¿este asiento de al lado está libre? ¿Le importaría si me siento?"},
            {"speaker": "学生B", "jp": "あ、どうぞ。荷物をどけますね。", "kana": "あ、どうぞ。にもつをどけますね。", "es": "Ah, adelante. Quito mis cosas."},
            {"speaker": "学生A", "jp": "すみません、お気遣いありがとうございます。パソコンの充電器を使っても差し支えないでしょうか？", "kana": "すみません、おきづかいありがとうございます。ぱそこんのじゅうでんきをつかってもさしつかえないでしょうか？", "es": "Muchas gracias por su gentileza. ¿Habría algún inconveniente si uso el cargador del portátil?"},
            {"speaker": "学生B", "jp": "ええ、コンセントは共用ですので遠慮なくお使いください。", "kana": "ええ、こんせんとはきょうようですのでえんりょなくおつかいください。", "es": "Claro, el enchufe es compartido, úselo sin ningún reparo."}
        ],
        "grammar_notes": "Permiso cortés con 〜てもかまわない y la fórmula de confianza 遠慮なく."
    },
    {
        "id": "iro_diag_19",
        "dialogue_num": 19,
        "title_jp": "救急車を呼んでほしいんです！",
        "title_es": "Llamando a emergencias y prestando auxilio ciudadano",
        "level": "N3",
        "topic": "Trabajo y Normas",
        "series": "Irodori (Fundación Japón)",
        "related_step": 34,
        "situation": "Una persona presencia una caída de bicicleta en la calle y pide socorro.",
        "characters": ["目撃者", "通行人"],
        "dialogue": [
            {"speaker": "目撃者", "jp": "すみません！そこの方、助けてください！お年寄りが転倒して頭から血を流しています！", "kana": "すみません！そこのかた、たすけてください！おとしよりがてんとうしてあたまからちをながしています！", "es": "¡Disculpe! ¡Usted el de ahí, ayúdeme por favor! ¡Un anciano se cayó y está sangrando de la cabeza!"},
            {"speaker": "通行人", "jp": "大変だ！意識はありますか？", "kana": "たいへんだ！いしきはありますか？", "es": "¡Dios mío! ¿Está consciente?"},
            {"speaker": "目撃者", "jp": "呼びかけに応じません！すぐに119番に電話して救急車を呼んでほしいんです！", "kana": "よびかけにおうじません！すぐにいちいちきゅうばんにでんわしてきゅうきゅうしゃをよんでほしいんです！", "es": "¡No responde a las llamadas! ¡Necesito que llame al 119 y pida una ambulancia inmediatamente!"},
            {"speaker": "通行人", "jp": "分かりました！私が救急車を呼びますので、あなたは体を毛布で温めてあげてください！", "kana": "わかりました！わたしがきゅうきゅうしゃをよびますので、あなたからはだをもーふであたためてあげてください！", "es": "¡Entendido! ¡Yo pido la ambulancia, tú mantén su cuerpo caliente con una manta!"}
        ],
        "grammar_notes": "Solicitud perentoria de acción urgente hacia un tercero: Verbo [Forma て] + ほしい."
    },
    {
        "id": "iro_diag_20",
        "dialogue_num": 20,
        "title_jp": "心よりお祝い申し上げます",
        "title_es": "Felicitación nupcial solemne y consulta personal",
        "level": "N3",
        "topic": "Ocio y Sociedad",
        "series": "Irodori (Fundación Japón)",
        "related_step": 35,
        "situation": "En la recepción de una boda, un invitado felicita a los novios y charla con amigos.",
        "characters": ["招待客", "新郎"],
        "dialogue": [
            {"speaker": "招待客", "jp": "田中さん、本日はご結婚誠におめでとうございます。心よりお祝い申し上げます。", "kana": "たなかさん、ほんじつはごけっこんまことにおめでとうございます。こころよりおいわいもうしあげます。", "es": "Tanaka, muchas felicidades de verdad por tu boda el día de hoy. Te expreso mis más sinceras felicitaciones de todo corazón."},
            {"speaker": "新郎", "jp": "ありがとうございます！遠くから来てくださって本当に感謝しています。", "kana": "ありがとうございます！とおくからきてくださってほんとうにかんしゃしています。", "es": "¡Muchas gracias! Te agradezco enormemente por haber venido desde tan lejos."},
            {"speaker": "招待客", "jp": "お二人の末永いお幸せをお祈りしております。素晴らしい披露宴ですね！", "kana": "おふたりのすえながいおしあわせをおいのりしております。すばらしいひろうえんですね！", "es": "Ruego por la felicidad eterna de ambos. ¡Es un banquete nupcial verdaderamente maravilloso!"}
        ],
        "grammar_notes": "Cortesía honorífica solemne en ritos vitales (冠婚葬祭) con お祝い申し上げます."
    },
    {
        "id": "iro_diag_21",
        "dialogue_num": 21,
        "title_jp": "桜島を見てみたいんです",
        "title_es": "Planificando una ruta por Kyushu y deseos de viaje",
        "level": "N3",
        "topic": "Ciudad y Servicios",
        "series": "Irodori (Fundación Japón)",
        "related_step": 36,
        "situation": "Dos amigos apasionados por el turismo planifican una ruta por el sur de Japón.",
        "characters": ["ユキ", "ケン"],
        "dialogue": [
            {"speaker": "ユキ", "jp": "次の連休に九州に行こうと思っているんだけど、どこがおすすめ？", "kana": "つぎのれんきゅうにきゅうしゅうにいこうとおもっているんだけど、どこがおすすめ？", "es": "Pienso ir a Kyushu el próximo puente festivo, ¿qué lugar me recomiendas?"},
            {"speaker": "ケン", "jp": "鹿児島が最高だよ！フェリーに乗って目の前から噴煙を上げる桜島を見てみたいと思わない？", "kana": "かごしまがさいこうだよ！ふぇりーにのってめのまえからふんえんをあげるさくらじまをみてみたいとおもわない？", "es": "¡Kagoshima es lo máximo! ¿No te gustaría probar a subir al ferry y contemplar ante tus ojos la humareda del Sakurajima?"},
            {"speaker": "ユキ", "jp": "ぜひ見てみたい！名物の黒豚しゃぶしゃぶも味わってみたいわ。", "kana": "ぜひみてみたい！めいぶつのくろぶたしゃぶしゃぶもあじわってみたいわ。", "es": "¡Sin falta me gustaría probarlo! También quiero probar el famoso shabu-shabu de cerdo negro local."}
        ],
        "grammar_notes": "Deseo vivencial en primera persona con 〜てみたい y vocabulario de geografía regional."
    },
    {
        "id": "iro_diag_22",
        "dialogue_num": 22,
        "title_jp": "こちらの部署で働かせていただければ幸いです",
        "title_es": "Entrevista formal de trabajo con Keigo corporativo",
        "level": "N3",
        "topic": "Trabajo y Normas",
        "series": "Irodori (Fundación Japón)",
        "related_step": 37,
        "situation": "Un candidato extranjero defiende sus aptitudes en una entrevista de selección.",
        "characters": ["面接官", "応募者"],
        "dialogue": [
            {"speaker": "面接官", "jp": "本日は弊社の面接にお越しいただきありがとうございます。志望動機をお聞かせいただけますか？", "kana": "ほんじつはへいしゃのめんせつにおこしいただきありがとうございます。しぼうどうきをおきかせいただけますか？", "es": "Muchas gracias por asistir hoy a nuestra entrevista. ¿Podría exponernos su motivación para postularse?"},
            {"speaker": "応募者", "jp": "はい。母国での物流業務の手順と日本での語学力を活かし、貴社の国際事業に貢献させていただければ幸いです。", "kana": "はい。ぼこくでのぶつりゅうぎょうむのてじゅんと にほんでのごがくりょくをいかし、きしゃのこくさいじぎょうにこうけんさせていただければさいわいです。", "es": "Sí. Aprovechando los procedimientos de logística de mi país y mi dominio del idioma en Japón, sería un gran honor si me permiten contribuir a los proyectos internacionales de su distinguida empresa."},
            {"speaker": "面接官", "jp": "素晴らしいですね。チーム内での「ほうれんそう（報連相）」も重視できますか？", "kana": "すばらしいですね。ちーむないでの「ほうれんそう」もじゅうしできますか？", "es": "Magnífico. ¿Es capaz también de priorizar el principio de 'Hou-Ren-So' (informar, comunicar y consultar) en equipo?"},
            {"speaker": "応募者", "jp": "はい、日々の進捗について小まめに報告と連絡を徹底いたします。", "kana": "はい、ひびのしんちょくについてこまめにほうこくとれんらくをてっていいたします。", "es": "Sí, me aseguraré de reportar y comunicar minuciosamente el avance diario."}
        ],
        "grammar_notes": "Causativo humilde 貢献させていただければ幸いです y Keigo corporativo (貴社, 弊社)."
    }
]

with open("data/irodori_dialogues.json", "w", encoding="utf-8") as f:
    json.dump(irodori_dialogues, f, ensure_ascii=False, indent=2)

print(f"✅ data/irodori_dialogues.json generado con {len(irodori_dialogues)} diálogos canónicos.")

# -------------------------------------------------------------------------
# 3. VINCULAR CONVERSACIONES E HISTORIAS EN data/curriculum.json
# -------------------------------------------------------------------------

with open("data/curriculum.json", "r", encoding="utf-8") as f:
    curriculum = json.load(f)

# Mapeo de historias por módulo
story_links_map = {
    # N5
    1: [{"id": "story_1", "chapter": 1, "title": "朝の始まり (Comienza la mañana)", "story_title": "日本での一日", "level": "N5", "link_url": "/story?id=story_1&chapter=1"}],
    3: [{"id": "story_1", "chapter": 2, "title": "学校への道と友達 (Camino a la escuela)", "story_title": "日本での一日", "level": "N5", "link_url": "/story?id=story_1&chapter=2"}],
    4: [{"id": "story_2", "chapter": 2, "title": "スーパーでの買い物と料理", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=2"}],
    5: [{"id": "story_1", "chapter": 4, "title": "昼休みと週末の計画 (Almuerzo y planes)", "story_title": "日本での一日", "level": "N5", "link_url": "/story?id=story_1&chapter=4"}],
    6: [{"id": "story_2", "chapter": 1, "title": "シェアハウスでの新しい生活", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=1"}],
    8: [{"id": "story_1", "chapter": 3, "title": "日本語の授業 (Clase de japonés)", "story_title": "日本での一日", "level": "N5", "link_url": "/story?id=story_1&chapter=3"}],
    10: [{"id": "story_2", "chapter": 4, "title": "下町の夏祭りと花火", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=4"}],
    11: [{"id": "story_2", "chapter": 4, "title": "下町の夏祭りと花火", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=4"}],
    12: [{"id": "story_2", "chapter": 3, "title": "地下鉄に乗って秋葉原へ", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=3"}],
    13: [{"id": "story_2", "chapter": 3, "title": "地下鉄に乗って秋葉原へ", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=3"}],
    14: [{"id": "story_2", "chapter": 2, "title": "スーパーでの買い物と料理", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=2"}],
    15: [{"id": "story_2", "chapter": 2, "title": "スーパーでの買い物と料理", "story_title": "東京での新しい暮らし", "level": "N5", "link_url": "/story?id=story_2&chapter=2"}],
    # N4
    20: [{"id": "story_3", "chapter": 1, "title": "日本に来たばかりの日々と電器屋", "story_title": "日本での挑戦と発見", "level": "N4", "link_url": "/story?id=story_3&chapter=1"}],
    21: [{"id": "story_3", "chapter": 2, "title": "ラーメン屋での注文とアレルギー", "story_title": "日本での挑戦と発見", "level": "N4", "link_url": "/story?id=story_3&chapter=2"}],
    22: [{"id": "story_3", "chapter": 1, "title": "日本に来たばかりの日々と電器屋", "story_title": "日本での挑戦と発見", "level": "N4", "link_url": "/story?id=story_3&chapter=1"}],
    23: [{"id": "story_3", "chapter": 3, "title": "突然の雨と地域のお祭り", "story_title": "日本での挑戦と発見", "level": "N4", "link_url": "/story?id=story_3&chapter=3"}],
    24: [{"id": "story_3", "chapter": 3, "title": "突然の雨と地域のお祭り", "story_title": "日本での挑戦と発見", "level": "N4", "link_url": "/story?id=story_3&chapter=3"}],
    25: [{"id": "story_3", "chapter": 1, "title": "日本に来たばかりの日々と電器屋", "story_title": "日本での挑戦と発見", "level": "N4", "link_url": "/story?id=story_3&chapter=1"}],
    26: [{"id": "story_3", "chapter": 4, "title": "美容院と不在票の連絡", "story_title": "日本での挑戦と発見", "level": "N4", "link_url": "/story?id=story_3&chapter=4"}],
    27: [{"id": "story_3", "chapter": 5, "title": "緊急地震速報と将来の夢", "story_title": "日本での挑戦と発見", "level": "N4", "link_url": "/story?id=story_3&chapter=5"}],
    28: [{"id": "story_3", "chapter": 5, "title": "緊急地震速報と将来の夢", "story_title": "日本での挑戦と発見", "level": "N4", "link_url": "/story?id=story_3&chapter=5"}],
    # N3
    29: [{"id": "story_4", "chapter": 3, "title": "カフェでのオタク談義と友情", "story_title": "日本社会で生きる：夢への架け橋", "level": "N3", "link_url": "/story?id=story_4&chapter=3"}],
    30: [{"id": "story_4", "chapter": 1, "title": "アパートの契約と引越し", "story_title": "日本社会で生きる：夢への架け橋", "level": "N3", "link_url": "/story?id=story_4&chapter=1"}],
    31: [{"id": "story_4", "chapter": 2, "title": "毎日の自炊と健康管理", "story_title": "日本社会で生きる：夢への架け橋", "level": "N3", "link_url": "/story?id=story_4&chapter=2"}],
    32: [{"id": "story_4", "chapter": 3, "title": "カフェでのオタク談義と友情", "story_title": "日本社会で生きる：夢への架け橋", "level": "N3", "link_url": "/story?id=story_4&chapter=3"}],
    35: [{"id": "story_4", "chapter": 3, "title": "カフェでのオタク談義と友情", "story_title": "日本社会で生きる：夢への架け橋", "level": "N3", "link_url": "/story?id=story_4&chapter=3"}],
    36: [{"id": "story_4", "chapter": 4, "title": "九州・桜島への一人旅", "story_title": "日本社会で生きる：夢への架け橋", "level": "N3", "link_url": "/story?id=story_4&chapter=4"}],
    37: [{"id": "story_4", "chapter": 5, "title": "運命の採用面接とこれからの私", "story_title": "日本社会で生きる：夢への架け橋", "level": "N3", "link_url": "/story?id=story_4&chapter=5"}]
}

# Mapeo de diálogos de Irodori y NHK por módulo
dialogue_links_map = {}

# Mapear Irodori dialogues
for d in irodori_dialogues:
    step = d["related_step"]
    dialogue_links_map.setdefault(step, []).append({
        "id": d["id"],
        "title_jp": d["title_jp"],
        "title_es": d["title_es"],
        "level": d["level"],
        "series": d["series"],
        "link_url": f"/nhk?dialogue={d['id']}",
        "speakers": d["characters"]
    })

# Cargar lecciones NHK y vincularlas a módulos
with open("data/nhk_lessons.json", "r", encoding="utf-8") as f:
    nhk_lessons = json.load(f)

# Mapear las 48 lecciones NHK a los primeros 19 módulos
nhk_module_map = {
    1: [1, 2], 2: [8], 3: [4, 5, 6, 15, 31], 4: [13], 5: [7, 17, 34, 42, 44],
    6: [14, 32], 7: [3, 10, 25], 8: [9], 9: [23, 24], 10: [11, 20, 45],
    11: [27, 41], 12: [12, 16, 28, 46], 13: [18, 38], 14: [35], 15: [35],
    16: [20], 17: [29, 30, 33, 37], 18: [19, 22, 36, 39, 40], 19: [21, 26, 43, 47, 48]
}

for step, l_nums in nhk_module_map.items():
    for l_num in l_nums:
        lesson_obj = next((l for l in nhk_lessons if l["lesson"] == l_num), None)
        if lesson_obj:
            dialogue_links_map.setdefault(step, []).append({
                "id": f"nhk_l_{l_num}",
                "lesson_num": l_num,
                "title_jp": lesson_obj["title_jp"],
                "title_es": lesson_obj["title_es"],
                "level": "N5",
                "series": "NHK World: Hablemos en Japonés",
                "link_url": f"/nhk?lesson={l_num}",
                "speakers": list(set(d["speaker"] for d in lesson_obj.get("dialogue", [])))
            })

for m in curriculum:
    step = m["step"]
    m["related_dialogues"] = dialogue_links_map.get(step, [])
    m["related_stories"] = story_links_map.get(step, [])

with open("data/curriculum.json", "w", encoding="utf-8") as f:
    json.dump(curriculum, f, ensure_ascii=False, indent=2)

print(f"✅ data/curriculum.json enriquecido con related_dialogues y related_stories en todos los módulos.")

